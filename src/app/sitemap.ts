import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/wordpress";
import { CATEGORIES } from "@/lib/categories";
import { AUTHORS } from "@/lib/authors";
import { getSitemapMatches } from "@/football/content";
import { COMPETITIONS } from "@/football/competitions";

// Primary freshness mechanism is on-demand: POST /api/revalidate (called by
// a WordPress publish webhook, see docs/wordpress-revalidate-webhook.md)
// calls revalidatePath("/sitemap.xml") the instant a post is published, so
// new articles normally appear within seconds. This time-based value is
// only the worst-case fallback if that webhook is ever missed or misfires —
// it was previously 86400 (24h), which is how a real published article sat
// out of the sitemap for a full day with nothing broken except the wait.
export const revalidate = 3600; // 1 hour fallback — see comment above

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${SITE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${SITE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${SITE_URL}/authors`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${SITE_URL}/editorial-policy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.4,
  },
  {
    url: `${SITE_URL}/privacy-policy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_URL}/cookie-policy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_URL}/terms-and-conditions`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_URL}/disclaimer`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_URL}/affiliate-disclosure`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_URL}/football`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/football/live`,
    lastModified: new Date(),
    changeFrequency: "always",
    priority: 0.6,
  },
  {
    url: `${SITE_URL}/football/today`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.7,
  },
];

const CATEGORY_ROUTES: MetadataRoute.Sitemap = CATEGORIES.map(({ slug }) => ({
  url: `${SITE_URL}/category/${slug}`,
  lastModified: new Date(),
  changeFrequency: "daily" as const,
  priority: 0.8,
}));

const AUTHOR_ROUTES: MetadataRoute.Sitemap = AUTHORS.map(({ slug }) => ({
  url: `${SITE_URL}/author/${slug}`,
  lastModified: new Date(),
  changeFrequency: "weekly" as const,
  priority: 0.6,
}));

// Football module — isolated feature, see src/football/. Its own data layer
// (getSitemapMatches) already handles a missing/unreachable provider by
// returning an empty array, so this can never break sitemap generation for
// the rest of the site.
const FOOTBALL_COMPETITION_ROUTES: MetadataRoute.Sitemap = COMPETITIONS.map(({ slug }) => ({
  url: `${SITE_URL}/football/competition/${slug}`,
  lastModified: new Date(),
  changeFrequency: "daily" as const,
  priority: 0.6,
}));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articleRoutes: MetadataRoute.Sitemap = [];
  let footballMatchRoutes: MetadataRoute.Sitemap = [];

  try {
    const posts = await getAllPosts(100);
    articleRoutes = posts.map((post) => ({
      url: `${SITE_URL}/article/${post.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // If WordPress is unreachable at build time, sitemap still generates without articles
  }

  const matches = await getSitemapMatches();
  footballMatchRoutes = matches.map((m) => ({
    url: `${SITE_URL}/football/watch/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.65,
  }));

  return [
    ...STATIC_ROUTES,
    ...CATEGORY_ROUTES,
    ...AUTHOR_ROUTES,
    ...articleRoutes,
    ...FOOTBALL_COMPETITION_ROUTES,
    ...footballMatchRoutes,
  ];
}
