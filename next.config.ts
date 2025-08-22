import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' ${
                isDev ? "'unsafe-eval'" : ""
              } https://vercel.analytics.edge.com https://cdn.vercel-insights.com https://vercel.live;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: https:;
              connect-src 'self' https://vercel.analytics.edge.com https://api.vercel.com;
              font-src 'self' https://fonts.gstatic.com;
              frame-src https://vercel.live;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
