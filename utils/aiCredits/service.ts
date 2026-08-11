import { AiCreditReason } from "./config";
import { createAdminClient } from "../supabase/server";

export type AiCreditBalance = {
  subscriptionCredits: number;
  lifetimeCredits: number;
  totalCredits: number;
  updatedAt: string | null;
};

export type AiCreditLedgerEntry = {
  id: number;
  subscriptionDelta: number;
  lifetimeDelta: number;
  reason: AiCreditReason;
  idempotencyKey: string | null;
  createdAt: string;
};

export type ConsumedCredits = AiCreditBalance & {
  subscriptionSpent: number;
  lifetimeSpent: number;
  wasDuplicate: boolean;
};

type RpcBalanceResult = {
  subscriptionCredits: number;
  lifetimeCredits: number;
  subscriptionSpent?: number;
  lifetimeSpent?: number;
  wasDuplicate?: boolean;
};

type ConsumeCreditsParams = {
  userId: string;
  amount: number;
  idempotencyKey: string;
};

type GrantCreditsParams = {
  userId: string;
  subscriptionAmount?: number;
  lifetimeAmount?: number;
  reason: Exclude<AiCreditReason, "agent_usage" | "subscription_expiration">;
  idempotencyKey: string;
};

export class InsufficientAiCreditsError extends Error {
  constructor() {
    super("Insufficient AI credits");
    this.name = "InsufficientAiCreditsError";
  }
}

function parseRpcBalance(data: unknown): RpcBalanceResult {
  if (!data || typeof data !== "object") {
    throw new Error("AI credit RPC returned an invalid response");
  }

  const result = data as Record<string, unknown>;
  const subscriptionCredits = result.subscriptionCredits;
  const lifetimeCredits = result.lifetimeCredits;

  if (
    typeof subscriptionCredits !== "number" ||
    typeof lifetimeCredits !== "number"
  ) {
    throw new Error("AI credit RPC returned an invalid balance");
  }

  return {
    subscriptionCredits,
    lifetimeCredits,
    ...(typeof result.subscriptionSpent === "number"
      ? { subscriptionSpent: result.subscriptionSpent }
      : {}),
    ...(typeof result.lifetimeSpent === "number"
      ? { lifetimeSpent: result.lifetimeSpent }
      : {}),
    ...(typeof result.wasDuplicate === "boolean"
      ? { wasDuplicate: result.wasDuplicate }
      : {}),
  };
}

function toBalance(result: RpcBalanceResult): AiCreditBalance {
  return {
    subscriptionCredits: result.subscriptionCredits,
    lifetimeCredits: result.lifetimeCredits,
    totalCredits: result.subscriptionCredits + result.lifetimeCredits,
    updatedAt: null,
  };
}

export async function getCreditBalance(
  userId: string,
): Promise<AiCreditBalance> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_credit_balances")
    .select("subscription_credits, lifetime_credits, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Unable to load AI credit balance: ${error.message}`);

  const subscriptionCredits = data?.subscription_credits ?? 0;
  const lifetimeCredits = data?.lifetime_credits ?? 0;

  return {
    subscriptionCredits,
    lifetimeCredits,
    totalCredits: subscriptionCredits + lifetimeCredits,
    updatedAt: data?.updated_at ?? null,
  };
}

export async function getCreditHistory(
  userId: string,
  limit = 25,
): Promise<AiCreditLedgerEntry[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_credit_ledger")
    .select(
      "id, subscription_delta, lifetime_delta, reason, idempotency_key, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(safeLimit);

  if (error) throw new Error(`Unable to load AI credit history: ${error.message}`);

  return (data ?? []).map((entry) => ({
    id: entry.id,
    subscriptionDelta: entry.subscription_delta,
    lifetimeDelta: entry.lifetime_delta,
    reason: entry.reason as AiCreditReason,
    idempotencyKey: entry.idempotency_key,
    createdAt: entry.created_at,
  }));
}

export async function consumeCredits({
  userId,
  amount,
  idempotencyKey,
}: ConsumeCreditsParams): Promise<ConsumedCredits> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("consume_ai_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: "agent_usage",
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    if (error.message.includes("insufficient_ai_credits")) {
      throw new InsufficientAiCreditsError();
    }
    throw new Error(`Unable to consume AI credits: ${error.message}`);
  }

  const result = parseRpcBalance(data);
  if (
    result.subscriptionSpent === undefined ||
    result.lifetimeSpent === undefined
  ) {
    throw new Error("AI credit consumption did not return spent amounts");
  }

  return {
    ...toBalance(result),
    subscriptionSpent: result.subscriptionSpent,
    lifetimeSpent: result.lifetimeSpent,
    wasDuplicate: result.wasDuplicate ?? false,
  };
}

export async function grantCredits({
  userId,
  subscriptionAmount = 0,
  lifetimeAmount = 0,
  reason,
  idempotencyKey,
}: GrantCreditsParams): Promise<AiCreditBalance> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("grant_ai_credits", {
    p_user_id: userId,
    p_subscription_amount: subscriptionAmount,
    p_lifetime_amount: lifetimeAmount,
    p_reason: reason,
    p_idempotency_key: idempotencyKey,
  });

  if (error) throw new Error(`Unable to grant AI credits: ${error.message}`);
  return toBalance(parseRpcBalance(data));
}

export async function refundConsumedCredits(
  userId: string,
  consumed: Pick<ConsumedCredits, "subscriptionSpent" | "lifetimeSpent">,
  chargeIdempotencyKey: string,
): Promise<AiCreditBalance> {
  return grantCredits({
    userId,
    subscriptionAmount: consumed.subscriptionSpent,
    lifetimeAmount: consumed.lifetimeSpent,
    reason: "refund",
    idempotencyKey: `${chargeIdempotencyKey}:refund`,
  });
}

export async function replaceSubscriptionCredits(
  userId: string,
  newAmount: number,
  idempotencyKey: string,
): Promise<AiCreditBalance> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("replace_subscription_credits", {
    p_user_id: userId,
    p_new_amount: newAmount,
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    throw new Error(`Unable to replace subscription credits: ${error.message}`);
  }
  return toBalance(parseRpcBalance(data));
}

export async function expireSubscriptionCredits(
  userId: string,
  idempotencyKey: string,
): Promise<AiCreditBalance> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("expire_subscription_credits", {
    p_user_id: userId,
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    throw new Error(`Unable to expire subscription credits: ${error.message}`);
  }
  return toBalance(parseRpcBalance(data));
}
