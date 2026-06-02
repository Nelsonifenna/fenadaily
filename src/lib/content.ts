import {
  getAllPosts,
  getAllCategories,
  getFeaturedPosts,
  getPostBySlug,
  getPageBySlug,
  getCategoryHighlights,
  type WPPage,
  type WPCategory,
  type CategoryHighlight,
} from "./wordpress";

export type { WPPage, WPCategory, CategoryHighlight };

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  author: string;
  publishedAt: string;
  featured?: boolean;
  trending?: boolean;
  image: string;
  content?: string;
};

// ── Posts ──────────────────────────────────────────────────────────────────

export async function getFeaturedStory(): Promise<Article | null> {
  const sticky = await getFeaturedPosts(1);
  if (sticky.length > 0) return sticky[0];
  const latest = await getAllPosts(1);
  return latest[0] ?? null;
}

export async function getTrendingStories(): Promise<Article[]> {
  return getAllPosts(6);
}

export async function getLatestPosts(limit = 6): Promise<Article[]> {
  return getAllPosts(limit);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return getPostBySlug(slug);
}

// ── Categories ─────────────────────────────────────────────────────────────

export { getCategoryHighlights };

export async function getCategories(): Promise<WPCategory[]> {
  return getAllCategories();
}

// ── Pages ──────────────────────────────────────────────────────────────────

export async function getAboutPage(): Promise<WPPage | null> {
  return getPageBySlug("about");
}

export async function getContactPage(): Promise<WPPage | null> {
  return getPageBySlug("contact");
}
