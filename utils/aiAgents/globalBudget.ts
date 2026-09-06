import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

import { getAgentAwsConfig } from "./awsConfig";
import {
  AI_AGENT_RESERVED_COST_MICRO_USD,
  AiAgentOperation,
} from "./operations";

const MICRO_USD_PER_USD = 1_000_000;
const TTL_GRACE_SECONDS = 48 * 60 * 60;
const NAMESPACE_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
const USD_PATTERN = /^(0|[1-9]\d*)(?:\.(\d{1,6}))?$/;

type DynamoDbSender = {
  send(command: UpdateItemCommand): Promise<unknown>;
};

type ReserveGlobalAiBudgetInput = {
  operation: AiAgentOperation;
  client?: DynamoDbSender;
  namespace?: string;
  nowMs?: number;
  tableName?: string;
};

export type GlobalAiBudgetResult = {
  allowed: boolean;
  budgetMicroUsd: number;
  reservedCostMicroUsd: number;
  totalReservedMicroUsd: number;
};

export class GlobalAiBudgetServiceError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GlobalAiBudgetServiceError";
  }
}

let cachedClient: DynamoDBClient | null = null;
let cachedClientKey = "";

function getDynamoDbClient(): DynamoDBClient {
  const config = getAgentAwsConfig();
  const clientKey = `${config.region}:${config.credentials.accessKeyId}`;
  if (!cachedClient || cachedClientKey !== clientKey) {
    cachedClient = new DynamoDBClient({
      credentials: config.credentials,
      region: config.region,
      maxAttempts: 3,
    });
    cachedClientKey = clientKey;
  }
  return cachedClient;
}

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new GlobalAiBudgetServiceError(`Missing ${name}`);
  return value;
}

export function parseUsdToMicroUsd(value: string): number {
  const match = USD_PATTERN.exec(value.trim());
  if (!match) {
    throw new GlobalAiBudgetServiceError(
      "AI_AGENT_GLOBAL_DAILY_BUDGET_USD must be a positive USD amount with at most six decimal places",
    );
  }

  const wholeDollars = Number(match[1]);
  const fractionalMicroUsd = Number((match[2] ?? "").padEnd(6, "0"));
  const result = wholeDollars * MICRO_USD_PER_USD + fractionalMicroUsd;
  if (!Number.isSafeInteger(result) || result <= 0) {
    throw new GlobalAiBudgetServiceError(
      "AI_AGENT_GLOBAL_DAILY_BUDGET_USD must be a positive safe integer amount",
    );
  }
  return result;
}

export function getGlobalAiBudgetMicroUsd(): number {
  return parseUsdToMicroUsd(
    requiredEnvironmentValue("AI_AGENT_GLOBAL_DAILY_BUDGET_USD"),
  );
}

function isConditionalFailure(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    (error as { name?: unknown }).name === "ConditionalCheckFailedException"
  );
}

function getUtcDay(nowMs: number): { day: string; expiresAtSeconds: number } {
  const now = new Date(nowMs);
  const day = now.toISOString().slice(0, 10);
  const nextDayUtcMs = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
  return {
    day,
    expiresAtSeconds: Math.floor(nextDayUtcMs / 1000) + TTL_GRACE_SECONDS,
  };
}

export async function reserveGlobalAiBudget({
  operation,
  client = getDynamoDbClient(),
  namespace = requiredEnvironmentValue("AI_AGENT_RATE_LIMIT_NAMESPACE"),
  nowMs = Date.now(),
  tableName = requiredEnvironmentValue("AI_AGENT_RATE_LIMIT_TABLE_NAME"),
}: ReserveGlobalAiBudgetInput): Promise<GlobalAiBudgetResult> {
  if (!NAMESPACE_PATTERN.test(namespace)) {
    throw new GlobalAiBudgetServiceError(
      "AI_AGENT_RATE_LIMIT_NAMESPACE must contain only letters, numbers, underscores, or hyphens",
    );
  }

  const budgetMicroUsd = getGlobalAiBudgetMicroUsd();
  const reservedCostMicroUsd = AI_AGENT_RESERVED_COST_MICRO_USD[operation];
  if (reservedCostMicroUsd > budgetMicroUsd) {
    return {
      allowed: false,
      budgetMicroUsd,
      reservedCostMicroUsd,
      totalReservedMicroUsd: 0,
    };
  }
  const { day, expiresAtSeconds } = getUtcDay(nowMs);
  const budgetKey = `${namespace}:global-ai-budget:${day}`;

  try {
    const result = (await client.send(
      new UpdateItemCommand({
        TableName: tableName,
        Key: { rate_limit_key: { S: budgetKey } },
        UpdateExpression:
          "SET #reserved = if_not_exists(#reserved, :zero) + :cost, " +
          "#expiresAt = if_not_exists(#expiresAt, :expiresAt)",
        ConditionExpression:
          "attribute_not_exists(#reserved) OR #reserved <= :maximumExisting",
        ExpressionAttributeNames: {
          "#reserved": "reserved_cost_micro_usd",
          "#expiresAt": "expires_at",
        },
        ExpressionAttributeValues: {
          ":zero": { N: "0" },
          ":cost": { N: String(reservedCostMicroUsd) },
          ":maximumExisting": {
            N: String(budgetMicroUsd - reservedCostMicroUsd),
          },
          ":expiresAt": { N: String(expiresAtSeconds) },
        },
        ReturnValues: "UPDATED_NEW",
      }),
    )) as { Attributes?: { reserved_cost_micro_usd?: { N?: string } } };
    return {
      allowed: true,
      budgetMicroUsd,
      reservedCostMicroUsd,
      totalReservedMicroUsd: Number(
        result.Attributes?.reserved_cost_micro_usd?.N ?? reservedCostMicroUsd,
      ),
    };
  } catch (error) {
    if (isConditionalFailure(error)) {
      return {
        allowed: false,
        budgetMicroUsd,
        reservedCostMicroUsd,
        totalReservedMicroUsd: budgetMicroUsd,
      };
    }
    throw new GlobalAiBudgetServiceError(
      "Unable to enforce the global AI daily budget",
      { cause: error },
    );
  }
}

export function logGlobalAiBudgetUsage(
  result: GlobalAiBudgetResult,
  operation: AiAgentOperation,
  namespace: string = process.env.AI_AGENT_RATE_LIMIT_NAMESPACE ?? "unknown",
): void {
  const percentage = Math.round(
    (result.totalReservedMicroUsd / result.budgetMicroUsd) * 100,
  );
  if (!result.allowed) {
    console.warn(
      JSON.stringify({
        event: "ai_global_daily_budget_exhausted",
        environment: namespace,
        date: new Date().toISOString().slice(0, 10),
        reserved_cost: result.totalReservedMicroUsd,
        daily_budget: result.budgetMicroUsd,
        percentage: 100,
        operation,
      }),
    );
  } else if (percentage >= 75) {
    const threshold = percentage >= 100 ? 100 : percentage >= 90 ? 90 : 75;
    console.warn(
      JSON.stringify({
        event: "ai_global_daily_budget_threshold_reached",
        environment: namespace,
        date: new Date().toISOString().slice(0, 10),
        reserved_cost: result.totalReservedMicroUsd,
        daily_budget: result.budgetMicroUsd,
        percentage,
        threshold,
        operation,
      }),
    );
  }
}
