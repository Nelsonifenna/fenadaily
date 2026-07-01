import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { getPostsByCategory } from "@/lib/wordpress";
import { CATEGORIES } from "@/lib/categories";

function getCategoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label
    ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getCategoryDescription(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.description ?? "";
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenadaily.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = getCategoryLabel(slug);
  const description = getCategoryDescription(slug) || `Browse all ${label} articles on Fena Daily.`;
  const ogImageUrl = `/api/og?title=${encodeURIComponent(label)}&type=category`;

  // Empty categories render a thin "Coming soon" placeholder — keep them out of
  // the index until they have content, without any manual upkeep. They self-correct
  // (re-index automatically) the moment the category gets its first article.
  const posts = await getPostsByCategory(slug, 1);
  const isEmpty = posts.length === 0;

  return {
    title: label,
    description,
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
    ...(isEmpty ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      url: `${SITE_URL}/category/${slug}`,
      title: `${label} | Fena Daily`,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: label }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} | Fena Daily`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const label = getCategoryLabel(slug);
  const description = getCategoryDescription(slug);
  const posts = await getPostsByCategory(slug, 24);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",  item: SITE_URL },
      { "@type": "ListItem", position: 2, name: label,   item: `${SITE_URL}/category/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <main className="min-h-screen bg-[linear-gradient(160deg,#08111f_0%,#0d1623_50%,#020617_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-8 lg:py-14">

        {/* Category header */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-5 py-8 shadow-2xl shadow-black/30 sm:rounded-[28px] sm:px-8 sm:py-10 md:px-12">
          <span className="text-xs uppercase tracking-[0.4em] text-amber-400 font-semibold">Topic</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {label}
          </h1>
          {description && (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              {description}
            </p>
          )}
          <p className="mt-4 text-sm text-zinc-500">
            {posts.length > 0
              ? `${posts.length} article${posts.length === 1 ? "" : "s"} published`
              : "No articles published yet"}
          </p>
        </div>

        {/* Articles grid */}
        {posts.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {posts.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-12 text-center sm:mt-6 sm:rounded-[28px] sm:px-8 sm:py-16">
            <p className="text-3xl">✦</p>
            <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">Coming soon</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">
              {label} coverage is coming to Fena Daily. Check back soon.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
            >
              ← Back to homepage
            </Link>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
