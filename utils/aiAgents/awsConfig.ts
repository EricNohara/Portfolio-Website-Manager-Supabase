export type AgentAwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
};

export type AgentAwsConfig = {
  credentials: AgentAwsCredentials;
  region: string;
};

export class AgentAwsConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentAwsConfigurationError";
  }
}

function requiredEnvironmentValue(
  environment: NodeJS.ProcessEnv,
  name: string,
): string {
  const value = environment[name]?.trim();
  if (!value) {
    throw new AgentAwsConfigurationError(`Missing ${name}`);
  }
  return value;
}

export function getAgentAwsConfig(
  environment: NodeJS.ProcessEnv = process.env,
): AgentAwsConfig {
  const accessKeyId = requiredEnvironmentValue(
    environment,
    "AI_AGENT_AWS_ACCESS_KEY_ID",
  );
  const secretAccessKey = requiredEnvironmentValue(
    environment,
    "AI_AGENT_AWS_SECRET_ACCESS_KEY",
  );
  const region = requiredEnvironmentValue(environment, "AI_AGENT_AWS_REGION");
  const sessionToken = environment.AI_AGENT_AWS_SESSION_TOKEN?.trim();

  return {
    credentials: {
      accessKeyId,
      secretAccessKey,
      ...(sessionToken ? { sessionToken } : {}),
    },
    region,
  };
}
