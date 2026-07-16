import type { NextConfig } from "next";

// Content-Security-Policy — allows only the origins this site actually needs:
// self (scripts/styles/fonts), the WordPress CMS + Unsplash + Gravatar for images,
// and the CMS for data fetches. 'unsafe-inline' is required for Next.js's
// hydration bootstrap scripts and the JSON-LD <script> tags rendered via
// dangerouslySetInnerHTML, and for React's inline `style` attributes.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cms.fenadaily.com https://fenadaily.com https://images.unsplash.com https://secure.gravatar.com",
  "font-src 'self' data:",
  "connect-src 'self' https://cms.fenadaily.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Next normally issues its own 308 redirect to strip trailing slashes
  // *before* the proxy runs, which would turn /home/ -> /home -> / into a
  // two-hop chain. Skipping it lets the proxy redirect /home/ straight to /
  // in a single hop while every other route's trailing-slash behavior is
  // unaffected (the proxy calls NextResponse.next() for everything else,
  // and Next still normalizes those internally during routing).
  skipTrailingSlashRedirect: true,

  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.fenadaily.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "fenadaily.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        // Cover images hosted on other domains (e.g. Unsplash placeholders)
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy",   value: CSP },
          { key: "X-DNS-Prefetch-Control",    value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
