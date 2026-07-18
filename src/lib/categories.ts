// Single source of truth for the site's topic/category system. Every surface
// that lists topics (Header nav + mobile menu, Footer, homepage topic chips,
// sitemap, category page metadata) reads from this array instead of keeping
// its own copy — so adding a topic here is enough to add it everywhere.
//
// `slug` must exactly match the slug WordPress generates for the category
// (WordPress lowercases the category name and hyphenates spaces the same way
// `categoryToSlug` in content.ts does) — that's what makes
// getPostsByCategory(slug) resolve to the right WordPress category
// automatically once a post is assigned to it, with no further code changes.
export type CategoryDef = {
  slug: string;
  label: string;
  description: string;
};

export const CATEGORIES: CategoryDef[] = [
  { slug: "ai",              label: "AI",              description: "Artificial intelligence, machine learning, and the technology shaping tomorrow." },
  { slug: "football",        label: "Football",        description: "Match analysis, transfers, tactics, and the beautiful game." },
  { slug: "crypto",          label: "Crypto",          description: "Cryptocurrency markets, blockchain, DeFi, and Web3 insights." },
  { slug: "business",        label: "Business",        description: "Entrepreneurship, strategy, markets, and business growth." },
  { slug: "technology",      label: "Technology",      description: "Product launches, software, platforms, and the digital world." },
  { slug: "personal-growth", label: "Personal Growth", description: "Mindset, habits, productivity, and becoming your best self." },
  { slug: "music",           label: "Music",           description: "New releases, artist spotlights, industry news, and the sounds defining our era." },
  { slug: "politics",        label: "Politics",        description: "Policy, elections, global affairs, and the decisions that shape society." },
  { slug: "global",          label: "Global",          description: "World news, international affairs, and the stories connecting the globe." },
  { slug: "astrology",       label: "Astrology",       description: "Horoscopes, zodiac insights, and the cosmic trends shaping your week." },
];

export function searchCategories(query: string): CategoryDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return CATEGORIES.filter(
    ({ label, description }) =>
      label.toLowerCase().includes(q) || description.toLowerCase().includes(q)
  );
}
