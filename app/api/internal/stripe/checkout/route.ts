import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/utils/auth/getAuthenticatedUser";
import { stripe } from "@/utils/stripe/stripe";
import { createAdminClient } from "@/utils/supabase/server";

type Body = { priceId: string };

function isPaidStatus(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

function toIso(unix: number | null | undefined) {
  return unix ? new Date(unix * 1000).toISOString() : null;
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase, response } = await getAuthenticatedUser();
    if (!user) return response;

    const { priceId } = (await req.json()) as Body;

    if (!priceId || !priceId.startsWith("price_")) {
      return NextResponse.json({ error: "Invalid priceId" }, { status: 400 });
    }

    // Look up stripe_customer_id from subscriptions (single-table approach)
    const { data: subRow, error: subErr } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subErr) {
      return NextResponse.json({ error: subErr.message }, { status: 500 });
    }

    let stripeCustomerId = subRow?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id }, // webhook fallback
      });

      stripeCustomerId = customer.id;

      // Use service-role client for upsert (RLS-safe)
      const admin = createAdminClient();
      const { error: upsertErr } = await admin.from("subscriptions").upsert(
        {
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (upsertErr) {
        return NextResponse.json({ error: upsertErr.message }, { status: 500 });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    let hasPaidSubscription = isPaidStatus(subRow?.status);

    // Repair a stale database row when a local webhook was not forwarded.
    if (!hasPaidSubscription && subRow?.stripe_customer_id) {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "all",
        limit: 10,
      });
      const existingSubscription = subscriptions.data.find((subscription) =>
        isPaidStatus(subscription.status),
      );

      if (existingSubscription) {
        const item = existingSubscription.items.data[0] ?? null;
        const admin = createAdminClient();
        const { error: repairErr } = await admin.from("subscriptions").upsert(
          {
            user_id: user.id,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: existingSubscription.id,
            status: existingSubscription.status,
            price_id: item?.price.id ?? null,
            current_period_end: toIso(item?.current_period_end),
            cancel_at_period_end: existingSubscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

        if (repairErr) {
          return NextResponse.json(
            { error: repairErr.message },
            { status: 500 },
          );
        }

        hasPaidSubscription = true;
      }
    }

    // Prevent multiple subscriptions - send to portal if existing sub
    if (hasPaidSubscription) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${appUrl}/user/settings/billing`,
      });

      return NextResponse.json(
        { url: portal.url, mode: "portal" },
        { status: 200 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/user/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/user/settings/billing?checkout=cancelled`,
      client_reference_id: user.id,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const error = err as Error;
    console.error("checkout error", error);
    return NextResponse.json(
      { error: error?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
