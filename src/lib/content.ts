import {
  getAllPosts,
  getAllCategories,
  getFeaturedPosts,
  getPostBySlug,
  getPostsByCategory,
  searchPosts,
  getPageBySlug,
  getCategoryHighlights,
  type WPPage,
  type WPCategory,
  type CategoryHighlight,
} from "./wordpress";

export type { WPPage, WPCategory, CategoryHighlight };

export type Article = {
  slug:          string;
  title:         string;
  excerpt:       string;
  category:      string;
  readingTime:   string;
  author:        string;
  datePublished: string; // ISO 8601 — use for structured data and OG publishedTime
  dateModified:  string; // ISO 8601 — use for structured data
  publishedAt:   string; // Human-readable display date
  featured?:     boolean;
  trending?:     boolean;
  image:         string;
  content?:      string;
};

// ── Posts ──────────────────────────────────────────────────────────────────

export async function getFeaturedStory(): Promise<Article | null> {
  const sticky = await getFeaturedPosts(1);
  if (sticky.length > 0) return sticky[0];
  const latest = await getAllPosts(1);
  return latest[0] ?? null;
}

// "Trending" = posts editorially marked sticky (mapped to `trending` on Article);
// falls back to latest non-trending posts when there aren't enough to fill the slot,
// mirroring the fallback pattern used by getRelatedArticles.
export async function getTrendingStories(limit = 6): Promise<Article[]> {
  const posts = await getAllPosts(Math.max(limit * 3, 18));
  const trending = posts.filter((p) => p.trending);
  if (trending.length >= limit) return trending.slice(0, limit);

  const fallback = posts.filter((p) => !p.trending);
  return [...trending, ...fallback].slice(0, limit);
}

export async function getLatestPosts(limit = 6): Promise<Article[]> {
  return getAllPosts(limit);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return getPostBySlug(slug);
}

export function categoryToSlug(categoryName: string): string {
  return categoryName.toLowerCase().trim().replace(/\s+/g, "-");
}

// Ranking signals available from the WordPress REST API are limited to
// publish recency and the editor-controlled "sticky" flag — there is no
// view-count or engagement data. This produces a stable, deterministic
// "most read" ordering today (sticky stories first, then most recent) while
// keeping a single seam (this function) to swap in real analytics-backed
// ranking later without touching any page that consumes it.
export async function getPopularStories(limit = 6): Promise<Article[]> {
  const posts = await getAllPosts(Math.max(limit * 2, 12));
  const ranked = [...posts].sort((a, b) => {
    if (a.trending !== b.trending) return a.trending ? -1 : 1;
    return new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime();
  });
  return ranked.slice(0, limit);
}

// "Related" = other stories from the same category; falls back to latest
// stories when the category has nothing else to offer (new/small categories).
export async function getRelatedArticles(article: Article, limit = 4): Promise<Article[]> {
  const slug = categoryToSlug(article.category);
  const sameCategory = (await getPostsByCategory(slug, limit + 1)).filter(
    (p) => p.slug !== article.slug
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const fallback = (await getAllPosts(limit + sameCategory.length + 1)).filter(
    (p) => p.slug !== article.slug && !sameCategory.some((s) => s.slug === p.slug)
  );
  return [...sameCategory, ...fallback].slice(0, limit);
}

export async function getMoreFromCategory(category: string, excludeSlug: string, limit = 4): Promise<Article[]> {
  const posts = await getPostsByCategory(categoryToSlug(category), limit + 1);
  return posts.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}

export async function searchArticles(query: string, limit = 20): Promise<Article[]> {
  return searchPosts(query, limit);
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
