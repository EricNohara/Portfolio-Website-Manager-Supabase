export const FREE_SIGNUP_LIFETIME_CREDITS = 3;

export const SUBSCRIPTION_CREDIT_ALLOCATIONS = {
  developer: {
    monthly: 25,
    yearly: 325,
  },
  premium: {
    monthly: 50,
    yearly: 650,
  },
} as const;

export const AI_CREDIT_COSTS = {
  resume: {
    generate: 1,
    generateAi: 2,
  },
  coverLetter: {
    generate: 3,
    revise: 1,
  },
  headshot: {
    generate: 6,
    revise: 6,
  },
} as const;

export type AiCreditReason =
  | "signup_grant"
  | "subscription_grant"
  | "subscription_expiration"
  | "credit_purchase"
  | "ad_reward"
  | "agent_usage"
  | "refund"
  | "admin_adjustment";

