import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/utils/auth/getAuthenticatedUser";
import { stripe } from "@/utils/stripe/stripe";
import { createAdminClient } from "@/utils/supabase/server";

type Body = { sessionId?: string };

function toIso(unix: number | null | undefined) {
  return unix ? new Date(unix * 1000).toISOString() : null;
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await getAuthenticatedUser();
    if (!user) return response;

    const { sessionId } = (await req.json()) as Body;

    if (!sessionId?.startsWith("cs_")) {
      return NextResponse.json(
        { error: "Invalid checkout session" },
        { status: 400 },
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.client_reference_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      session.mode !== "subscription" ||
      session.status !== "complete" ||
      !session.subscription
    ) {
      return NextResponse.json(
        { error: "Checkout is not complete" },
        { status: 409 },
      );
    }

    const subscription =
      typeof session.subscription === "string"
        ? await stripe.subscriptions.retrieve(session.subscription)
        : session.subscription;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
    const item = subscription.items.data[0] ?? null;

    const admin = createAdminClient();
    const { error: upsertErr } = await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        price_id: item?.price.id ?? null,
        current_period_end: toIso(item?.current_period_end),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (upsertErr) {
      throw upsertErr;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const error = err as Error;
    console.error("checkout confirmation error", error);
    return NextResponse.json(
      { error: error?.message ?? "Server error" },
      { status: 500 },
    );
  }
}
