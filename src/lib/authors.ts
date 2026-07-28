import fs from "node:fs";
import path from "node:path";

// Single source of truth for the site's author system — mirrors the pattern
// already used for blog categories (src/lib/categories.ts). Add a writer
// here and every surface that reads from this registry (author pages,
// bylines, structured data, sitemap) picks them up automatically.

export type AuthorSocialLink = {
  label: string;
  href: string;
  icon: "linkedin" | "github" | "x" | "email";
};

export type AuthorProfile = {
  slug: string;
  name: string;
  jobTitle: string;
  bio: string;
  /** Path under /public, e.g. "/authors/nelson-joseph.jpg". */
  photo: string;
  email: string;
  social: AuthorSocialLink[];
};

export const AUTHORS: AuthorProfile[] = [
  {
    slug: "nelson-joseph",
    name: "Nelson Joseph",
    jobTitle: "Founder & Editor",
    bio:
      "I'm Nelson Joseph, founder and editor of Fena Daily. I specialise in covering artificial " +
      "intelligence, business, technology, Web3, finance, and digital innovation. Through in-depth " +
      "research and clear, accessible writing, I aim to break down complex subjects into practical " +
      "insights that help readers understand emerging trends and stay ahead in a fast-changing " +
      "digital world.",
    photo: "/authors/nelson-joseph.jpg",
    email: "nelsonjoseph1878@gmail.com",
    social: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/nelsonjosep", icon: "linkedin" },
      { label: "GitHub",   href: "https://github.com/Nelsonifenna",         icon: "github" },
      { label: "X",        href: "https://x.com/mrfecox",                  icon: "x" },
      { label: "Email",    href: "mailto:nelsonjoseph1878@gmail.com",       icon: "email" },
    ],
  },
];

export const DEFAULT_AUTHOR_SLUG = "nelson-joseph";

// Maps whatever raw author display name WordPress happens to return (e.g.
// "admin", an old placeholder, or nothing at all) to a registered author
// slug. Anything not explicitly listed below — including "Admin" and any
// other placeholder — falls back to DEFAULT_AUTHOR_SLUG. This is what
// migrates every existing article (and defaults every future one) to
// Nelson Joseph without editing a single WordPress post: add a new entry
// here only when a *different* writer publishes under their own WP user.
const WP_AUTHOR_NAME_MAP: Record<string, string> = {
  "nelson joseph": "nelson-joseph",
  "nelson": "nelson-joseph",
};

export function resolveAuthorSlug(rawWordPressAuthorName: string): string {
  const key = rawWordPressAuthorName.trim().toLowerCase();
  return WP_AUTHOR_NAME_MAP[key] ?? DEFAULT_AUTHOR_SLUG;
}

export function getAuthorBySlug(slug: string): AuthorProfile | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}

export function getDefaultAuthor(): AuthorProfile {
  const author = getAuthorBySlug(DEFAULT_AUTHOR_SLUG);
  if (!author) throw new Error(`DEFAULT_AUTHOR_SLUG "${DEFAULT_AUTHOR_SLUG}" is not in AUTHORS`);
  return author;
}

export function getAuthorXHandle(author: AuthorProfile): string | undefined {
  const x = author.social.find((s) => s.icon === "x");
  if (!x) return undefined;
  const handle = x.href.replace(/\/+$/, "").split("/").pop();
  return handle ? `@${handle}` : undefined;
}

// Checked at request/build time on the server — lets every page that shows
// an author photo fall back to an initials avatar (same pattern already
// used elsewhere on the site) until the real file is added, instead of
// rendering a broken image. Swap in the real photo at the exact `photo`
// path above and it appears everywhere automatically, with no code change.
export function authorPhotoExists(author: AuthorProfile): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", author.photo));
  } catch {
    return false;
  }
}
