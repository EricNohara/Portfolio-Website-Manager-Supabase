import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpRequest } from "@smithy/protocol-http";
import { SignatureV4 } from "@smithy/signature-v4";

import {
  AgentAwsConfig,
  AgentAwsConfigurationError,
  getAgentAwsConfig,
} from "./awsConfig";
import { AiAgentOperation } from "./operations";

type InvokeAiAgentInput<TBody> = {
  baseUrl: string;
  path: string;
  body: TBody;
  operation: AiAgentOperation;
  requestId: string;
  userId: string;
};

type CreateSignedAgentRequestInput<TBody> = InvokeAiAgentInput<TBody> & {
  awsConfig?: AgentAwsConfig;
};

function buildAgentUrl(baseUrl: string, path: string, region: string): URL {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new AgentAwsConfigurationError("Invalid AI agent base URL");
  }

  const expectedSuffix = `.lambda-url.${region}.on.aws`;
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(expectedSuffix) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new AgentAwsConfigurationError(
      `AI agent URL must be an HTTPS Lambda Function URL in ${region}`,
    );
  }

  const basePath = url.pathname.replace(/\/+$/, "");
  const operationPath = path.replace(/^\/+/, "");
  url.pathname = `${basePath}/${operationPath}`;
  return url;
}

export async function createSignedAgentRequest<TBody>({
  awsConfig = getAgentAwsConfig(),
  baseUrl,
  path,
  body,
  operation,
  requestId,
  userId,
}: CreateSignedAgentRequestInput<TBody>): Promise<{
  body: string;
  headers: Record<string, string>;
  url: URL;
}> {
  const url = buildAgentUrl(baseUrl, path, awsConfig.region);
  const serializedBody = JSON.stringify(body);
  const signer = new SignatureV4({
    credentials: awsConfig.credentials,
    region: awsConfig.region,
    service: "lambda",
    sha256: Sha256,
  });

  const signedRequest = await signer.sign(
    new HttpRequest({
      protocol: url.protocol,
      hostname: url.hostname,
      method: "POST",
      path: url.pathname,
      headers: {
        host: url.host,
        "content-type": "application/json",
        "x-nukleio-operation": operation,
        "x-nukleio-request-id": requestId,
        "x-nukleio-user-id": userId,
      },
      body: serializedBody,
    }),
  );

  const headers = Object.fromEntries(
    Object.entries(signedRequest.headers).filter(
      ([name]) => name.toLowerCase() !== "host",
    ),
  );

  return { body: serializedBody, headers, url };
}

export async function invokeAiAgent<TBody>(
  input: InvokeAiAgentInput<TBody>,
): Promise<Response> {
  const request = await createSignedAgentRequest(input);

  return fetch(request.url, {
    method: "POST",
    headers: request.headers,
    body: request.body,
    cache: "no-store",
    redirect: "error",
  });
}
