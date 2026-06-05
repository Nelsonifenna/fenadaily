/**
 * WordPress REST API Integration — fenadaily.com
 *
 * IMPORTANT: WORDPRESS_URL must point to the WordPress installation directly,
 * NOT to the Vercel/Next.js deployment domain. If both share the same domain
 * (e.g. fenadaily.com serves Next.js), WordPress must be accessible at a
 * separate URL — e.g. cms.fenadaily.com or the hosting provider's direct URL.
 */

const WORDPRESS_URL = (process.env.WORDPRESS_URL ?? "https://fenadaily.com").replace(/\/+$/, "");
const WP_API = `${WORDPRESS_URL}/wp-json/wp/v2`;

const REVALIDATE_POSTS = 1800;
const REVALIDATE_PAGES = 3600;
const REVALIDATE_CATS  = 3600;

// Headers added to every WordPress API request.
// A realistic User-Agent is required — WAFs and CDNs block headless fetches
// with no User-Agent or with known-bot identifiers.
const WP_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; FenaDaily/1.0; +https://fenadaily.com/)",
  "Accept":     "application/json",
} as const;

async function wpFetch(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...init,
    redirect: "follow",
    headers: { ...WP_HEADERS, ...(init.headers as Record<string, string> | undefined) },
  });
}

// ── Raw API shapes ─────────────────────────────────────────────────────────

type WPTerm    = { id: number; name: string; slug: string };
type WPMedia   = { source_url: string };
type WPAuthor  = { name: string };

type WPRawPost = {
  slug: string;
  date: string;
  sticky: boolean;
  featured: boolean;
  title:   { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    author?:             WPAuthor[];
    "wp:featuredmedia"?: WPMedia[];
    "wp:term"?:          WPTerm[][];
  };
};

type WPRawCategory = {
  id:          number;
  slug:        string;
  name:        string;
  description: string;
  count:       number;
};

type WPRawPage = {
  id:      number;
  slug:    string;
  title:   { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
};

// ── Helpers ────────────────────────────────────────────────────────────────

function calculateReadingTime(text: string): string {
  return `${Math.ceil(text.split(/\s+/).length / 200)} min read`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function sanitizeAuthor(name: string): string {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(name.trim())) return "Fena Daily";
  return name;
}

function extractCategoryName(post: WPRawPost): string {
  const terms = post._embedded?.["wp:term"];
  if (Array.isArray(terms) && Array.isArray(terms[0]) && terms[0].length > 0) {
    return terms[0][0].name;
  }
  return "General";
}

function mapPost(post: WPRawPost) {
  const rawAuthor = post._embedded?.author?.[0]?.name ?? "Fena Daily";
  return {
    slug:        post.slug,
    title:       post.title.rendered,
    excerpt:     stripHtml(post.excerpt?.rendered ?? "").substring(0, 160),
    category:    extractCategoryName(post),
    readingTime: calculateReadingTime(post.content?.rendered ?? ""),
    author:      sanitizeAuthor(rawAuthor),
    publishedAt: new Date(post.date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    }),
    featured:  post.featured ?? false,
    trending:  post.sticky   ?? false,
    image:     post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "",
    content:   post.content?.rendered ?? "",
  };
}

// ── Posts ──────────────────────────────────────────────────────────────────

export async function getAllPosts(limit = 20) {
  const url = `${WP_API}/posts?per_page=${limit}&_embed=author,wp:featuredmedia,wp:term&orderby=date&order=desc`;
  try {
    const res = await wpFetch(url, { next: { revalidate: REVALIDATE_POSTS } });
    if (!res.ok) {
      console.error(`[wp] getAllPosts failed — ${res.status} ${res.statusText} — URL: ${url}`);
      return [];
    }
    const posts: WPRawPost[] = await res.json();
    return Array.isArray(posts) ? posts.map(mapPost) : [];
  } catch (err) {
    console.error(`[wp] getAllPosts fetch error — URL: ${url}`, err);
    return [];
  }
}

export async function getFeaturedPosts(limit = 3) {
  const url = `${WP_API}/posts?sticky=true&per_page=${limit}&_embed=author,wp:featuredmedia,wp:term`;
  try {
    const res = await wpFetch(url, { next: { revalidate: REVALIDATE_POSTS } });
    if (!res.ok) {
      console.error(`[wp] getFeaturedPosts failed — ${res.status} ${res.statusText} — URL: ${url}`);
      return [];
    }
    const posts: WPRawPost[] = await res.json();
    if (!Array.isArray(posts) || posts.length === 0) return [];
    return posts.map((p) => ({ ...mapPost(p), featured: true }));
  } catch (err) {
    console.error(`[wp] getFeaturedPosts fetch error — URL: ${url}`, err);
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  const url = `${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed=author,wp:featuredmedia,wp:term`;
  try {
    const res = await wpFetch(url, { next: { revalidate: REVALIDATE_POSTS } });
    if (!res.ok) {
      console.error(`[wp] getPostBySlug("${slug}") failed — ${res.status} ${res.statusText} — URL: ${url}`);
      return null;
    }
    const posts: WPRawPost[] = await res.json();
    if (!Array.isArray(posts) || posts.length === 0) {
      console.warn(`[wp] getPostBySlug("${slug}") — no posts returned — URL: ${url}`);
      return null;
    }
    return mapPost(posts[0]);
  } catch (err) {
    console.error(`[wp] getPostBySlug("${slug}") fetch error — URL: ${url}`, err);
    return null;
  }
}

export async function getPostsByCategory(categorySlug: string, limit = 20) {
  const catUrl = `${WP_API}/categories?slug=${encodeURIComponent(categorySlug)}`;
  try {
    const catRes = await wpFetch(catUrl, { next: { revalidate: REVALIDATE_CATS } });
    if (!catRes.ok) {
      console.error(`[wp] getPostsByCategory category lookup failed — ${catRes.status} — URL: ${catUrl}`);
      return [];
    }
    const cats: WPRawCategory[] = await catRes.json();
    if (!Array.isArray(cats) || cats.length === 0) return [];

    const catId = cats[0].id;
    const url = `${WP_API}/posts?categories=${catId}&per_page=${limit}&_embed=author,wp:featuredmedia,wp:term&orderby=date&order=desc`;
    const res = await wpFetch(url, { next: { revalidate: REVALIDATE_POSTS } });
    if (!res.ok) {
      console.error(`[wp] getPostsByCategory posts fetch failed — ${res.status} — URL: ${url}`);
      return [];
    }
    const posts: WPRawPost[] = await res.json();
    return Array.isArray(posts) ? posts.map(mapPost) : [];
  } catch {
    return [];
  }
}

// ── Categories ─────────────────────────────────────────────────────────────

export type WPCategory = {
  slug:        string;
  name:        string;
  description: string;
  count:       number;
};

export async function getAllCategories(): Promise<WPCategory[]> {
  const url = `${WP_API}/categories?per_page=100&hide_empty=false`;
  try {
    const res = await wpFetch(url, { next: { revalidate: REVALIDATE_CATS } });
    if (!res.ok) {
      console.error(`[wp] getAllCategories failed — ${res.status} — URL: ${url}`);
      return [];
    }
    const cats: WPRawCategory[] = await res.json();
    return Array.isArray(cats)
      ? cats.map((c) => ({
          slug:        c.slug,
          name:        c.name,
          description: c.description ?? "",
          count:       c.count ?? 0,
        }))
      : [];
  } catch (err) {
    console.error(`[wp] getAllCategories fetch error — URL: ${url}`, err);
    return [];
  }
}

export type CategoryHighlight = {
  label:       string;
  slug:        string;
  count:       number;
  description: string;
};

const NAV_CATEGORIES: { label: string; slug: string }[] = [
  { label: "AI",              slug: "ai" },
  { label: "Football",        slug: "football" },
  { label: "Crypto",          slug: "crypto" },
  { label: "Business",        slug: "business" },
  { label: "Technology",      slug: "technology" },
  { label: "Personal Growth", slug: "personal-growth" },
  { label: "Music",           slug: "music" },
  { label: "Politics",        slug: "politics" },
];

export async function getCategoryHighlights(): Promise<CategoryHighlight[]> {
  const wpCats = await getAllCategories();
  return NAV_CATEGORIES.map(({ label, slug }) => {
    const match = wpCats.find((c) => c.slug === slug);
    return {
      label,
      slug,
      count:       match?.count       ?? 0,
      description: match?.description ?? "",
    };
  });
}

// ── Pages ──────────────────────────────────────────────────────────────────

export type WPPage = {
  id:      number;
  slug:    string;
  title:   string;
  content: string;
  excerpt: string;
};

export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const url = `${WP_API}/pages?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,content,excerpt`;
  try {
    const res = await wpFetch(url, { next: { revalidate: REVALIDATE_PAGES } });
    if (!res.ok) {
      console.error(`[wp] getPageBySlug("${slug}") failed — ${res.status} — URL: ${url}`);
      return null;
    }
    const pages: WPRawPage[] = await res.json();
    if (!Array.isArray(pages) || pages.length === 0) return null;
    const p = pages[0];
    return {
      id:      p.id,
      slug:    p.slug,
      title:   p.title?.rendered   ?? "",
      content: p.content?.rendered ?? "",
      excerpt: stripHtml(p.excerpt?.rendered ?? ""),
    };
  } catch (err) {
    console.error(`[wp] getPageBySlug("${slug}") fetch error — URL: ${url}`, err);
    return null;
  }
}
