import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArticleCard } from "@/components/ArticleCard";
import { SearchForm } from "@/components/SearchForm";
import { searchArticles } from "@/lib/content";
import { searchCategories } from "@/lib/categories";
import { getDefaultAuthor, authorPhotoExists } from "@/lib/authors";

function initials(name: string): string {
  return name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const AUTHOR_QUERY_PATTERN = /fena\s*daily|editorial|author|team|writer|journalist/i;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";

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
  const matchedCategories = query ? searchCategories(query) : [];
  const matchedAuthors = query ? AUTHOR_QUERY_PATTERN.test(query) : false;
  const hasAnyResults = results.length > 0 || matchedCategories.length > 0 || matchedAuthors;
  const author = getDefaultAuthor();
  const hasPhoto = authorPhotoExists(author);

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
                {hasAnyResults
                  ? <>Showing results for &ldquo;<span className="text-amber-300">{query}</span>&rdquo;</>
                  : <>No results for &ldquo;<span className="text-amber-300">{query}</span>&rdquo;</>}
              </p>

              {hasAnyResults ? (
                <div className="space-y-8">
                  {/* Matching topics */}
                  {matchedCategories.length > 0 && (
                    <section>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {matchedCategories.map(({ label, slug }) => (
                          <Link
                            key={slug}
                            href={`/category/${slug}`}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-200"
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Matching authors */}
                  {matchedAuthors && (
                    <section>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">Authors</p>
                      <Link
                        href={`/author/${author.slug}`}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 transition-colors hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-200 sm:max-w-sm"
                      >
                        {hasPhoto ? (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                            <Image src={author.photo} alt={author.name} fill sizes="36px" className="object-cover" />
                          </div>
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-xs font-bold text-amber-300">
                            {initials(author.name)}
                          </span>
                        )}
                        <span>
                          <span className="block font-medium">{author.name}</span>
                          <span className="block text-xs text-zinc-500">View author profile</span>
                        </span>
                      </Link>
                    </section>
                  )}

                  {/* Matching articles */}
                  {results.length > 0 && (
                    <section>
                      {(matchedCategories.length > 0 || matchedAuthors) && (
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                          Articles ({results.length})
                        </p>
                      )}
                      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                        {results.map((article) => (
                          <ArticleCard key={article.slug} article={article} />
                        ))}
                      </div>
                    </section>
                  )}
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
