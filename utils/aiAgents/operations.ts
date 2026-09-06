export const AI_AGENT_OPERATIONS = [
  "resume_generate",
  "resume_generate_ai",
  "cover_letter_generate",
  "cover_letter_revise",
  "headshot_generate",
  "headshot_revise",
] as const;

export type AiAgentOperation = (typeof AI_AGENT_OPERATIONS)[number];

// Conservative preflight reservations in micro-USD. These intentionally sit
// above the current expected provider cost so the daily circuit breaker fails
// closed before actual spend can exceed its configured ceiling.
export const AI_AGENT_RESERVED_COST_MICRO_USD: Record<
  AiAgentOperation,
  number
> = {
  resume_generate: 20_000,
  resume_generate_ai: 20_000,
  cover_letter_generate: 50_000,
  cover_letter_revise: 50_000,
  headshot_generate: 100_000,
  headshot_revise: 100_000,
};

const OPERATION_LABELS: Record<AiAgentOperation, string> = {
  resume_generate: "resume generation",
  resume_generate_ai: "AI resume generation",
  cover_letter_generate: "cover letter generation",
  cover_letter_revise: "cover letter revision",
  headshot_generate: "headshot generation",
  headshot_revise: "headshot revision",
};

export function getAiAgentOperationLabel(operation: AiAgentOperation): string {
  return OPERATION_LABELS[operation];
}
