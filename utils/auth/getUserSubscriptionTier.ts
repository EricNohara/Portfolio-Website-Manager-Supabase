import {
  getSubscriptionPlanForPriceId,
  isPaidSubscriptionStatus,
  Tier,
} from "../subscriptions/config";
import { createClient } from "../supabase/server";

export type { Tier } from "../subscriptions/config";

export async function getUserSubscriptionTier(userId: string): Promise<Tier> {
  const supabase = await createClient();

  // get the sub for the user
  const { data } = await supabase
    .from("subscriptions")
    .select("status, price_id")
    .eq("user_id", userId)
    .maybeSingle();

  const status = data?.status ?? null;
  const priceId = data?.price_id ?? null;

  // derive the tier
  const plan = getSubscriptionPlanForPriceId(priceId);
  return isPaidSubscriptionStatus(status) && plan ? plan.tier : "free";
}
