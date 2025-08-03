import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // apply to all routes
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' https://vercel.analytics.edge.com https://cdn.vercel-insights.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: https:;
              connect-src 'self' https://vercel.analytics.edge.com https://api.vercel.com;
              font-src 'self' https://fonts.gstatic.com;
              frame-src 'none';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
