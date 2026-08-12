// utils/navigation/documentation.ts

export const DOCUMENTATION_PATHS = {
  product: "/product",
  docs: "/docs",
  pricing: "/pricing",
  contact: "/contact",
  privacy: "/legal/privacy",
  terms: "/legal/terms",
  apiKeys: "/docs/creating-api-keys",
  aiAgents: "/product#generative-ai-agents",
  // change this later after writing docs for ai credits
  aiCredits: "/pricing",
} as const;

export type DocumentationPage = keyof typeof DOCUMENTATION_PATHS;

export function createDocumentationUrl(
  page: DocumentationPage,
  returnTo?: string,
): string {
  const docsBaseUrl = process.env.NEXT_PUBLIC_NUKLEIO_DOCS_BASE_URL;

  const appBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!docsBaseUrl) {
    throw new Error("NEXT_PUBLIC_NUKLEIO_DOCS_BASE_URL is not configured.");
  }

  const documentationUrl = new URL(DOCUMENTATION_PATHS[page], docsBaseUrl);

  const resolvedReturnTo = returnTo ?? appBaseUrl;

  if (resolvedReturnTo) {
    documentationUrl.searchParams.set("returnTo", resolvedReturnTo);
  }

  return documentationUrl.toString();
}
