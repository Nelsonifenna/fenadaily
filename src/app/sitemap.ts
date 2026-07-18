import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/wordpress";
import { CATEGORIES } from "@/lib/categories";

export const revalidate = 86400; // regenerate once per day

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
];

const CATEGORY_ROUTES: MetadataRoute.Sitemap = CATEGORIES.map(({ slug }) => ({
  url: `${SITE_URL}/category/${slug}`,
  lastModified: new Date(),
  changeFrequency: "daily" as const,
  priority: 0.8,
}));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articleRoutes: MetadataRoute.Sitemap = [];

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

  return [...STATIC_ROUTES, ...CATEGORY_ROUTES, ...articleRoutes];
}
