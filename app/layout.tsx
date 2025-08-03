import "./globals.css";
import { Container } from "@mui/material";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { AuthProvider } from "./context/AuthProvider";
import LocalizationProviderWrapper from "./context/LocalizationProviderWrapper";
import Navigation from "./navigation";

export const metadata = {
  title: "Portfolio Website Manager",
  description: "All in one solution for portfolio website management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <AuthProvider>
          <LocalizationProviderWrapper>
            <Navigation />
            <Container sx={{ padding: "5% 0 5% 0" }}>
              {children}
              <SpeedInsights />
              <Analytics />
            </Container>
          </LocalizationProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
