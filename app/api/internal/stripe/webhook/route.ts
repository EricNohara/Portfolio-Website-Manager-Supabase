import { NextResponse } from "next/server";
import Stripe from "stripe";

import { SUBSCRIPTION_CREDIT_ALLOCATIONS } from "@/utils/aiCredits/config";
import {
  expireSubscriptionCredits,
  replaceSubscriptionCredits,
} from "@/utils/aiCredits/service";
import { stripe } from "@/utils/stripe/stripe";
import {
  getSubscriptionPlanForPriceId,
  isPaidSubscriptionStatus,
} from "@/utils/subscriptions/config";
import { createAdminClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

function toIso(unix: number | null | undefined) {
  return unix ? new Date(unix * 1000).toISOString() : null;
}

function getStripeId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const invoiceData = invoice as unknown as {
    subscription?: unknown;
    parent?: {
      subscription_details?: { subscription?: unknown } | null;
    } | null;
  };

  return (
    getStripeId(invoiceData.subscription) ??
    getStripeId(invoiceData.parent?.subscription_details?.subscription)
  );
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const subscriptionData = subscription as unknown as {
    current_period_end?: number | null;
  };
  return subscriptionData.current_period_end ?? null;
}

function getInvoicePriceId(invoice: Stripe.Invoice): string | null {
  const getPriceId = (line: Stripe.InvoiceLineItem) => {
    const lineData = line as unknown as {
      price?: unknown;
      pricing?: { price_details?: { price?: unknown } | null } | null;
    };
    return (
      getStripeId(lineData.price) ??
      getStripeId(lineData.pricing?.price_details?.price)
    );
  };

  // Upgrade invoices can include a negative line for the old plan and a
  // positive line for the new plan. Prefer the charged plan, then fall back to
  // any configured subscription line for zero-dollar/trial invoices.
  for (const line of invoice.lines.data.filter((item) => item.amount > 0)) {
    const priceId = getPriceId(line);
    if (priceId) return priceId;
  }

  for (const line of invoice.lines.data) {
    const priceId = getPriceId(line);
    if (priceId) return priceId;
  }

  return null;
}

async function getUserIdForCustomer(customerId: string) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!error && data?.user_id) return data.user_id;

  const customer = (await stripe.customers.retrieve(
    customerId
  )) as Stripe.Customer;
  const userId =
    typeof customer.metadata?.user_id === "string"
      ? customer.metadata.user_id
      : null;

  return userId;
}

async function grantCreditsForPaidInvoice(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const customerId = getStripeId(invoice.customer);
  if (!customerId) throw new Error(`Invoice ${invoice.id} has no customer`);

  const userId = await getUserIdForCustomer(customerId);
  if (!userId) throw new Error(`No user found for Stripe customer ${customerId}`);

  const priceId = getInvoicePriceId(invoice);
  const plan = getSubscriptionPlanForPriceId(priceId);
  if (!plan) {
    throw new Error(`No AI credit allocation configured for Stripe price ${priceId}`);
  }

  const allocation = SUBSCRIPTION_CREDIT_ALLOCATIONS[plan.tier][plan.interval];
  await replaceSubscriptionCredits(
    userId,
    allocation,
    `stripe_invoice_${invoice.id}`,
  );
}

async function expireCreditsForFailedRenewal(invoice: Stripe.Invoice) {
  if (invoice.billing_reason !== "subscription_cycle") return;

  const customerId = getStripeId(invoice.customer);
  if (!customerId) return;

  const userId = await getUserIdForCustomer(customerId);
  if (!userId) throw new Error(`No user found for Stripe customer ${customerId}`);

  await expireSubscriptionCredits(userId, `stripe_invoice_${invoice.id}`);
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig)
    return new NextResponse("Missing stripe-signature", { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const error = err as Error;
    console.error("Webhook signature verify failed:", error?.message);
    return new NextResponse(`Webhook Error: ${error?.message}`, {
      status: 400,
    });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const userId = await getUserIdForCustomer(customerId);
        if (!userId) {
          console.warn(
            "No userId for customer:",
            customerId,
            "event:",
            event.type
          );
          return new NextResponse("ok", { status: 200 });
        }

        if (event.type === "customer.subscription.deleted") {
          const { data: currentSubscription, error: currentSubscriptionError } =
            await admin
              .from("subscriptions")
              .select("stripe_subscription_id, status")
              .eq("user_id", userId)
              .maybeSingle();

          if (currentSubscriptionError) throw currentSubscriptionError;
          if (
            currentSubscription?.stripe_subscription_id &&
            currentSubscription.stripe_subscription_id !== sub.id &&
            isPaidSubscriptionStatus(currentSubscription.status)
          ) {
            break;
          }
        }

        const item = sub.items?.data?.[0] ?? null;
        const priceId = item?.price?.id ?? null;

        const currentPeriodEndUnix = getSubscriptionPeriodEnd(sub);

        const payload = {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          status: sub.status,
          price_id: priceId,
          current_period_end: toIso(currentPeriodEndUnix),
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          updated_at: new Date().toISOString(),
        };

        const { error: upsertErr } = await admin
          .from("subscriptions")
          .upsert(payload, { onConflict: "user_id" });

        if (upsertErr) throw upsertErr;

        if (event.type === "customer.subscription.deleted") {
          await expireSubscriptionCredits(
            userId,
            `stripe_subscription_${sub.id}_ended_${currentPeriodEndUnix ?? event.id}`,
          );
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        const userId = session.client_reference_id;

        if (customerId && userId) {
          const { error } = await admin.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

          if (error) throw error;
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await grantCreditsForPaidInvoice(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await expireCreditsForFailedRenewal(invoice);
        break;
      }

      default:
        break;
    }

    return new NextResponse("ok", { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error("Webhook handler error:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
