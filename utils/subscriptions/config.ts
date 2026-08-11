export type Tier = "free" | "developer" | "premium";
export type PaidTier = Exclude<Tier, "free">;
export type BillingInterval = "monthly" | "yearly";

export type SubscriptionPlan = {
  tier: PaidTier;
  interval: BillingInterval;
};

const PRICE_PLANS: Array<SubscriptionPlan & { priceId: string | undefined }> = [
  {
    priceId: process.env.NEXT_PUBLIC_DEVELOPER_MONTHLY_PRICE_ID,
    tier: "developer",
    interval: "monthly",
  },
  {
    priceId: process.env.NEXT_PUBLIC_DEVELOPER_YEARLY_PRICE_ID,
    tier: "developer",
    interval: "yearly",
  },
  {
    priceId: process.env.NEXT_PUBLIC_PREMIUM_MONTHLY_PRICE_ID,
    tier: "premium",
    interval: "monthly",
  },
  {
    priceId: process.env.NEXT_PUBLIC_PREMIUM_YEARLY_PRICE_ID,
    tier: "premium",
    interval: "yearly",
  },
];

export function getSubscriptionPlanForPriceId(
  priceId: string | null | undefined,
): SubscriptionPlan | null {
  if (!priceId) return null;

  const plan = PRICE_PLANS.find((candidate) => candidate.priceId === priceId);
  return plan ? { tier: plan.tier, interval: plan.interval } : null;
}

export function isPaidSubscriptionStatus(
  status: string | null | undefined,
): boolean {
  return status === "active" || status === "trialing";
}

