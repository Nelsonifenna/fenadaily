import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { SearchForm } from "@/components/SearchForm";
import { searchArticles } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenadaily.com";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Fena Daily for articles across AI, Football, Crypto, Business, Technology, Music, Politics, and more.",
  alternates: { canonical: `${SITE_URL}/search` },
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchArticles(query, 24) : [];

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#08111f_0%,#0d1623_50%,#020617_100%)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-5 py-8 shadow-2xl shadow-black/30 sm:rounded-[28px] sm:px-8 sm:py-10 md:px-12">
          <span className="text-xs uppercase tracking-[0.4em] text-amber-400 font-semibold">Search</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Find a story
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Search across every article Fena Daily has published: AI, Football, Crypto, Business, Technology, Music, Politics, and more.
          </p>
          <div className="mt-6">
            <SearchForm defaultValue={query} />
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          {!query ? (
            <p className="text-sm text-zinc-500">Type a keyword above to search Fena Daily&apos;s archive.</p>
          ) : (
            <>
              <p className="mb-5 text-sm text-zinc-400 sm:mb-6">
                {results.length > 0
                  ? <>Showing <span className="font-semibold text-white">{results.length}</span> result{results.length === 1 ? "" : "s"} for &ldquo;<span className="text-amber-300">{query}</span>&rdquo;</>
                  : <>No results for &ldquo;<span className="text-amber-300">{query}</span>&rdquo;</>}
              </p>

              {results.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                  {results.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-12 text-center sm:rounded-[28px] sm:px-8 sm:py-16">
                  <p className="text-3xl">✦</p>
                  <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">Nothing found</h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">
                    Try a different keyword, or browse stories by topic instead.
                  </p>
                  <Link
                    href="/"
                    className="mt-8 inline-flex rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
                  >
                    ← Back to homepage
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
