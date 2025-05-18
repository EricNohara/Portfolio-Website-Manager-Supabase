import "./globals.css";
import Navigation from "./navigation";
import { AuthProvider } from "./context/AuthProvider";
import LocalizationProviderWrapper from "./context/LocalizationProviderWrapper";
import { Container } from "@mui/material";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Portfolio Website Editor",
  description: "Manager for portfolio website information and file storage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LocalizationProviderWrapper>
            <Navigation />
            <Container sx={{ padding: "5% 0 5% 0" }}>
              {children}
              <SpeedInsights />
            </Container>
          </LocalizationProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
