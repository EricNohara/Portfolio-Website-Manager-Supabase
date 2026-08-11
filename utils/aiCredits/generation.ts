import { randomUUID } from "crypto";

import {
  consumeCredits,
  ConsumedCredits,
  refundConsumedCredits,
} from "./service";

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export function getGenerationChargeKey(
  request: Request,
  userId: string,
  operation: string,
): string {
  const suppliedKey = request.headers.get("idempotency-key");
  const operationId =
    suppliedKey && IDEMPOTENCY_KEY_PATTERN.test(suppliedKey)
      ? suppliedKey
      : randomUUID();

  return `agent_generation_${userId}_${operation}_${operationId}`;
}

export type AiGenerationCharge = {
  idempotencyKey: string;
  consumed: ConsumedCredits;
};

export class DuplicateAiGenerationError extends Error {
  constructor() {
    super("This AI generation request has already been charged");
    this.name = "DuplicateAiGenerationError";
  }
}

export class AiGenerationRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AiGenerationRequestError";
  }
}

export async function chargeAiGeneration(
  request: Request,
  userId: string,
  operation: string,
  amount: number,
): Promise<AiGenerationCharge> {
  const idempotencyKey = getGenerationChargeKey(request, userId, operation);
  const consumed = await consumeCredits({ userId, amount, idempotencyKey });

  if (consumed.wasDuplicate) throw new DuplicateAiGenerationError();
  return { idempotencyKey, consumed };
}

export async function refundAiGeneration(
  userId: string,
  charge: AiGenerationCharge,
): Promise<void> {
  await refundConsumedCredits(
    userId,
    charge.consumed,
    charge.idempotencyKey,
  );
}
