import type { NextConfig } from "next";

// Content-Security-Policy — allows only the origins this site actually needs:
// self (scripts/styles/fonts), the WordPress CMS + Unsplash + Gravatar for images,
// and the CMS for data fetches. 'unsafe-inline' is required for Next.js's
// hydration bootstrap scripts and the JSON-LD <script> tags rendered via
// dangerouslySetInnerHTML, and for React's inline `style` attributes.
//
// script-src/img-src/connect-src also allowlist Google AdSense/Analytics
// hosts ahead of time — no such scripts are loaded today (see .env.example /
// AdSense audit notes), but CSP blocks unknown hosts by default, so wiring
// these in now means enabling those products later doesn't require another
// CSP edit. Google Fonts needs no allowance: next/font self-hosts the Geist
// family at build time, so the browser never requests fonts.googleapis.com.
const GOOGLE_ADS_HOSTS = [
  "https://pagead2.googlesyndication.com",
  "https://tpc.googlesyndication.com",
  "https://googleads.g.doubleclick.net",
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
];

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${GOOGLE_ADS_HOSTS.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https://cms.fenadaily.com https://fenadaily.com https://images.unsplash.com https://secure.gravatar.com ${GOOGLE_ADS_HOSTS.join(" ")}`,
  "font-src 'self' data:",
  `connect-src 'self' https://cms.fenadaily.com ${GOOGLE_ADS_HOSTS.join(" ")}`,
  // youtube/vimeo: sanitize-html (src/lib/wordpress.ts) allows these as
  // embedded iframes in article content — without this, CSP would silently
  // block them from rendering even though the sanitizer lets them through.
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
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
          { key: "X-Content-Type-Options",       value: "nosniff" },
          { key: "X-Frame-Options",              value: "DENY" },
          { key: "X-XSS-Protection",             value: "1; mode=block" },
          { key: "Referrer-Policy",              value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",           value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security",    value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy",      value: CSP },
          { key: "X-DNS-Prefetch-Control",       value: "on" },
          // same-origin-allow-popups (not the stricter "same-origin") so ad
          // formats/share dialogs that open popups from this page still work;
          // it still stops other origins from reaching into this page via
          // window.opener.
          { key: "Cross-Origin-Opener-Policy",   value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          // Cross-Origin-Embedder-Policy is intentionally NOT set: COEP:
          // require-corp (the only value that adds real isolation) blocks
          // Google AdSense and YouTube/Vimeo embeds outright, since neither
          // sends the CORP/CORS headers COEP requires. There is no
          // AdSense-compatible non-default value, so it's left unset.
        ],
      },
    ];
  },
};

export default nextConfig;
