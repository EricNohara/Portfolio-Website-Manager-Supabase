import { NextResponse } from "next/server";

import { AiAgentOperation } from "./operations";
import {
  AiRateLimitResult,
  getAiRateLimitMessage,
} from "./rateLimit";

export function createAiRateLimitResponse(
  operation: AiAgentOperation,
  result: AiRateLimitResult,
): NextResponse {
  const message = getAiRateLimitMessage(
    operation,
    result.retryAfterSeconds,
  );

  return NextResponse.json(
    {
      code: "AI_RATE_LIMIT_EXCEEDED",
      error: message,
      message,
      retryAfterSeconds: result.retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(result.retryAfterSeconds),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(result.windowEndsAtSeconds),
      },
    },
  );
}
