export function allowSelfSignedCertificatesInDevelopment() {
  if (process.env.NODE_ENV !== "development") return;

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
