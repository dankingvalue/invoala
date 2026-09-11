import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const CHROMIUM_INCLUDES = [
    "./node_modules/@sparticuz/chromium/bin/**/*",
    "./node_modules/@sparticuz/chromium/build/**/*",
    "./node_modules/playwright-core/**/*",
  ];

const nextConfig: NextConfig = {
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    // Keys are glob patterns: "[id]" is read as a character class, not a
    // literal, so a dynamic segment must use "*" instead (verified against
    // real Node File Trace output). Only these routes call Chromium, so
    // don't broaden this back to "/api/**" — that bundled the ~80MB
    // Chromium+Playwright binary into all 100+ API routes and was the
    // actual cause of Vercel's function storage ballooning to tens of GB.
    "/api/invoices/*/pdf": CHROMIUM_INCLUDES,
    "/api/invoices/*/email": CHROMIUM_INCLUDES,
    "/api/invoices/*/remind": CHROMIUM_INCLUDES,
    "/api/clients/*/statement": CHROMIUM_INCLUDES,
    "/api/clients/*/statement/pdf": CHROMIUM_INCLUDES,
    "/api/pdf-engine": CHROMIUM_INCLUDES,
    "/api/cron/recurring": CHROMIUM_INCLUDES,
    // Dashboard can lazily trigger recurring (PDF) generation for Pro users.
    "/dashboard": CHROMIUM_INCLUDES,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/free-invoice-generator",
        destination: "/invoice-generator",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // The /embed page is designed to be embedded in third-party sites via iframe.
        source: "/embed",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
