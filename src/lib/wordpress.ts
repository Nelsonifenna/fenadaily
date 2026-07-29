/**
 * WordPress REST API Integration — fenadaily.com
 *
 * IMPORTANT: WORDPRESS_URL must point to the WordPress installation directly,
 * NOT to the Vercel/Next.js deployment domain. If both share the same domain
 * (e.g. fenadaily.com serves Next.js), WordPress must be accessible at a
 * separate URL — e.g. cms.fenadaily.com or the hosting provider's direct URL.
 */

import sanitizeHtml from "sanitize-html";
import { decode } from "he";
import { CATEGORIES } from "./categories";
import { resolveAuthorSlug, getAuthorBySlug, getDefaultAuthor } from "./authors";

const WORDPRESS_URL = (process.env.WORDPRESS_URL ?? "https://cms.fenadaily.com").replace(/\/+$/, "");
const WP_API = `${WORDPRESS_URL}/wp-json/wp/v2`;

// When a WordPress site is copied to a new domain (e.g. fenadaily.com →
// cms.fenadaily.com via Hostinger's Copy Website), the database retains the
// original siteurl. Media source_url values therefore still reference the old
// domain. These hosts point to the Next.js frontend on Vercel — not to the
// WordPress file system — so image requests against them return 404.
// normalizeMediaUrl / normalizeContentHtml rewrite those stale references to
// the active CMS hostname so images resolve correctly without requiring a
// WordPress database search-replace.
const CMS_HOSTNAME    = new URL(WORDPRESS_URL).hostname;
const LEGACY_WP_HOSTS = ["fenadaily.com", "www.fenadaily.com"];

function normalizeMediaUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (LEGACY_WP_HOSTS.includes(parsed.hostname) && parsed.pathname.startsWith("/wp-content/")) {
      return url.replace(`//${parsed.hostname}/`, `//${CMS_HOSTNAME}/`);
    }
  } catch { /* not a valid URL */ }
  return url;
}

function normalizeContentHtml(html: string): string {
  if (!html) return html;
  let out = html;
  for (const host of LEGACY_WP_HOSTS) {
    out = out.replaceAll(`https://${host}/wp-content/`, `https://${CMS_HOSTNAME}/wp-content/`);
  }
  return out;
}

// Article HTML comes from the WordPress REST API and is rendered with
// dangerouslySetInnerHTML. Sanitize it server-side so a compromised CMS
// account, vulnerable plugin, or malicious contributor can't inject
// stored XSS (<script>, event handlers, javascript: URLs, etc.) into
// pages served to every visitor and to Googlebot.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "span", "div",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "u", "s", "mark", "small", "sub", "sup",
    "a", "blockquote", "q", "cite", "code", "pre",
    "ul", "ol", "li", "dl", "dt", "dd",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    "figure", "figcaption", "img", "picture", "source",
    "iframe",
  ],
  allowedAttributes: {
    a:       ["href", "title", "rel", "target"],
    img:     ["src", "srcset", "sizes", "alt", "title", "width", "height", "loading"],
    source:  ["src", "srcset", "sizes", "type", "media"],
    iframe:  ["src", "title", "width", "height", "allow", "allowfullscreen", "frameborder"],
    "*":     ["class", "id"],
  },
  allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com", "www.youtube-nocookie.com"],
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }, true),
  },
};

function sanitizeContentHtml(html: string): string {
  if (!html) return html;
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

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
  slug:     string;
  date:     string;
  modified: string;
  sticky:   boolean;
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

// WordPress's REST API returns title/excerpt text HTML-entity-encoded
// (e.g. "&#8217;" for a right single quote, "&amp;" for "&"). Titles and
// excerpts are rendered as plain React text (not dangerouslySetInnerHTML),
// so without decoding, entities show up literally instead of the
// punctuation they represent. Strip any markup first, then decode.
function decodeWpText(html: string): string {
  return decode(stripHtml(html ?? "")).trim();
}

function extractCategoryName(post: WPRawPost): string {
  const terms = post._embedded?.["wp:term"];
  if (Array.isArray(terms) && Array.isArray(terms[0]) && terms[0].length > 0) {
    return decodeWpText(terms[0][0].name);
  }
  return "General";
}

function mapPost(post: WPRawPost) {
  // Every article is attributed via the author registry (src/lib/authors.ts),
  // never WordPress's raw author field directly — this is what migrates
  // every existing post (and defaults every future one) to the resolved
  // author without editing WordPress, and guarantees a placeholder like
  // "Admin" can never surface on a public page.
  const rawAuthor = decodeWpText(post._embedded?.author?.[0]?.name ?? "");
  const authorSlug = resolveAuthorSlug(rawAuthor);
  const author = getAuthorBySlug(authorSlug) ?? getDefaultAuthor();
  return {
    slug:          post.slug,
    title:         decodeWpText(post.title?.rendered ?? ""),
    excerpt:       decodeWpText(post.excerpt?.rendered ?? "").substring(0, 160),
    category:      extractCategoryName(post),
    readingTime:   calculateReadingTime(post.content?.rendered ?? ""),
    author:        author.name,
    authorSlug:    author.slug,
    datePublished: post.date,                          // ISO 8601 — for structured data & OG
    dateModified:  post.modified ?? post.date,         // ISO 8601 — for structured data
    publishedAt:   new Date(post.date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    }),
    featured:  post.featured ?? false,
    trending:  post.sticky   ?? false,
    image:     normalizeMediaUrl(post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? ""),
    content:   sanitizeContentHtml(normalizeContentHtml(post.content?.rendered ?? "")),
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

// Used by the sitemap only. getAllPosts(limit) is a single request capped at
// WordPress's own per_page ceiling of 100 — fine for pages that intentionally
// want just "the latest N" (homepage, category listings), but the sitemap
// needs *every* published post regardless of how many there are. This walks
// every page WordPress reports via X-WP-TotalPages so a post never silently
// drops out of the sitemap purely because the site passed 100 articles.
export async function getAllPostsForSitemap() {
  const perPage = 100;
  const baseUrl = `${WP_API}/posts?per_page=${perPage}&_embed=author,wp:featuredmedia,wp:term&orderby=date&order=desc`;

  try {
    const firstRes = await wpFetch(`${baseUrl}&page=1`, { next: { revalidate: REVALIDATE_POSTS } });
    if (!firstRes.ok) {
      console.error(`[wp] getAllPostsForSitemap page 1 failed — ${firstRes.status} ${firstRes.statusText}`);
      return [];
    }

    const firstPage: WPRawPost[] = await firstRes.json();
    const allPosts: WPRawPost[] = Array.isArray(firstPage) ? [...firstPage] : [];

    // Safety cap (50 pages = up to 5,000 posts) guards against an endless
    // loop if WordPress ever reports a bogus X-WP-TotalPages value.
    const totalPages = Math.min(Number(firstRes.headers.get("X-WP-TotalPages")) || 1, 50);

    if (totalPages > 1) {
      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((page) =>
          wpFetch(`${baseUrl}&page=${page}`, { next: { revalidate: REVALIDATE_POSTS } })
        )
      );
      for (const res of remainingPages) {
        if (!res.ok) {
          console.error(`[wp] getAllPostsForSitemap pagination request failed — ${res.status} ${res.statusText}`);
          continue;
        }
        const pagePosts: WPRawPost[] = await res.json();
        if (Array.isArray(pagePosts)) allPosts.push(...pagePosts);
      }
    }

    return allPosts.map(mapPost);
  } catch (err) {
    console.error("[wp] getAllPostsForSitemap fetch error:", err);
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

export async function searchPosts(query: string, limit = 20) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url = `${WP_API}/posts?search=${encodeURIComponent(trimmed)}&per_page=${limit}&_embed=author,wp:featuredmedia,wp:term&orderby=relevance`;
  try {
    const res = await wpFetch(url, { next: { revalidate: REVALIDATE_POSTS } });
    if (!res.ok) {
      console.error(`[wp] searchPosts("${trimmed}") failed — ${res.status} ${res.statusText} — URL: ${url}`);
      return [];
    }
    const posts: WPRawPost[] = await res.json();
    return Array.isArray(posts) ? posts.map(mapPost) : [];
  } catch (err) {
    console.error(`[wp] searchPosts("${trimmed}") fetch error — URL: ${url}`, err);
    return [];
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
          name:        decodeWpText(c.name),
          description: decodeWpText(c.description ?? ""),
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

export async function getCategoryHighlights(): Promise<CategoryHighlight[]> {
  const wpCats = await getAllCategories();
  return CATEGORIES.map(({ label, slug }) => {
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
      title:   decodeWpText(p.title?.rendered ?? ""),
      content: p.content?.rendered ?? "",
      excerpt: decodeWpText(p.excerpt?.rendered ?? ""),
    };
  } catch (err) {
    console.error(`[wp] getPageBySlug("${slug}") fetch error — URL: ${url}`, err);
    return null;
  }
}
