import "./globals.css";
import Navigation from "./navigation";
import { AuthProvider } from "./context/AuthProvider";
import LocalizationProviderWrapper from "./context/LocalizationProviderWrapper";
import { Container } from "@mui/material";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Portfolio Manager",
  description: "Manager for portfolio website information and file storage",
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
