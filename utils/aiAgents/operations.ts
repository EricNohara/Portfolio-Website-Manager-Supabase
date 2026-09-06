export const AI_AGENT_OPERATIONS = [
  "resume_generate",
  "resume_generate_ai",
  "cover_letter_generate",
  "cover_letter_revise",
  "headshot_generate",
  "headshot_revise",
] as const;

export type AiAgentOperation = (typeof AI_AGENT_OPERATIONS)[number];

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
