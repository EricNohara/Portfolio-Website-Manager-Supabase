type WarningToast = {
  warning(
    message: string,
    messageDescription?: string,
    duration?: number,
  ): void;
};

type ErrorPayload = {
  message?: unknown;
};

const FALLBACK_RATE_LIMIT_MESSAGE =
  "You have reached the limit of 10 requests per 10 minutes for this operation. Please try again later.";

export function showAiRateLimitToast(
  response: Response,
  payload: unknown,
  toast: WarningToast,
): boolean {
  if (response.status !== 429) return false;

  const payloadMessage =
    payload && typeof payload === "object"
      ? (payload as ErrorPayload).message
      : undefined;
  const message =
    typeof payloadMessage === "string"
      ? payloadMessage
      : FALLBACK_RATE_LIMIT_MESSAGE;

  toast.warning("Rate limit reached", message, 10_000);
  return true;
}
