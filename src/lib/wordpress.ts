/**
 * WordPress REST API Integration — fenadaily.com
 */

const WORDPRESS_URL = process.env.WORDPRESS_URL ?? "https://fenadaily.com";
const WP_API = `${WORDPRESS_URL}/wp-json/wp/v2`;

const REVALIDATE_POSTS = 1800;
const REVALIDATE_PAGES = 3600;
const REVALIDATE_CATS  = 3600;

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
  try {
    const res = await fetch(
      `${WP_API}/posts?per_page=${limit}&_embed=author,wp:featuredmedia,wp:term&orderby=date&order=desc`,
      { next: { revalidate: REVALIDATE_POSTS } }
    );
    if (!res.ok) return [];
    const posts: WPRawPost[] = await res.json();
    return Array.isArray(posts) ? posts.map(mapPost) : [];
  } catch {
    return [];
  }
}

export async function getFeaturedPosts(limit = 3) {
  try {
    const res = await fetch(
      `${WP_API}/posts?sticky=true&per_page=${limit}&_embed=author,wp:featuredmedia,wp:term`,
      { next: { revalidate: REVALIDATE_POSTS } }
    );
    if (!res.ok) return [];
    const posts: WPRawPost[] = await res.json();
    if (!Array.isArray(posts) || posts.length === 0) return [];
    return posts.map((p) => ({ ...mapPost(p), featured: true }));
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const res = await fetch(
      `${WP_API}/posts?slug=${slug}&_embed=author,wp:featuredmedia,wp:term`,
      { next: { revalidate: REVALIDATE_POSTS } }
    );
    if (!res.ok) return null;
    const posts: WPRawPost[] = await res.json();
    if (!Array.isArray(posts) || posts.length === 0) return null;
    return mapPost(posts[0]);
  } catch {
    return null;
  }
}

export async function getPostsByCategory(categorySlug: string, limit = 20) {
  try {
    const catRes = await fetch(
      `${WP_API}/categories?slug=${categorySlug}`,
      { next: { revalidate: REVALIDATE_CATS } }
    );
    if (!catRes.ok) return [];
    const cats: WPRawCategory[] = await catRes.json();
    if (!Array.isArray(cats) || cats.length === 0) return [];

    const catId = cats[0].id;
    const res = await fetch(
      `${WP_API}/posts?categories=${catId}&per_page=${limit}&_embed=author,wp:featuredmedia,wp:term&orderby=date&order=desc`,
      { next: { revalidate: REVALIDATE_POSTS } }
    );
    if (!res.ok) return [];
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
  try {
    const res = await fetch(
      `${WP_API}/categories?per_page=100&hide_empty=false`,
      { next: { revalidate: REVALIDATE_CATS } }
    );
    if (!res.ok) return [];
    const cats: WPRawCategory[] = await res.json();
    return Array.isArray(cats)
      ? cats.map((c) => ({
          slug:        c.slug,
          name:        c.name,
          description: c.description ?? "",
          count:       c.count ?? 0,
        }))
      : [];
  } catch {
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
  try {
    const res = await fetch(
      `${WP_API}/pages?slug=${slug}&_fields=id,slug,title,content,excerpt`,
      { next: { revalidate: REVALIDATE_PAGES } }
    );
    if (!res.ok) return null;
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
  } catch {
    return null;
  }
}
