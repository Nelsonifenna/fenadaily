import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenadaily.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/og must be crawlable — Google needs it to fetch OG images for
        // Discover and rich previews. The more-specific /api/og allow overrides
        // the broader /api/ disallow per Google's longest-match rule.
        allow: ["/", "/api/og"],
        disallow: ["/api/", "/studio/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
