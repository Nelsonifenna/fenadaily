import Link from "next/link";
import Image from "next/image";
import { ArticleCard } from "@/components/ArticleCard";
import { StoryRow } from "@/components/StoryRow";
import { SectionHeader } from "@/components/SectionHeader";
import {
  getFeaturedStory,
  getLatestPosts,
  getTrendingStories,
  getPopularStories,
  getCategoryHighlights,
} from "@/lib/content";

export default async function Home() {
  const [featuredStory, latestPosts, trending, popular, categoryHighlights] = await Promise.all([
    getFeaturedStory(),
    getLatestPosts(13),
    getTrendingStories(5),
    getPopularStories(5),
    getCategoryHighlights(),
  ]);

  const rest = latestPosts.filter((p) => p.slug !== featuredStory?.slug);
  const featuredGrid = rest.slice(0, 3);
  const latestGrid = rest.slice(3, 9);

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#08111f_0%,#0d1623_50%,#020617_100%)] text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Fena Daily
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-300 sm:mt-5 sm:text-lg md:text-xl">
              Independent coverage of AI, Football, Crypto, Business, Technology, and Personal Growth, reported and explained for curious, ambitious people.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
              {featuredStory && (
                <Link
                  href={`/article/${featuredStory.slug}`}
                  className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors sm:px-6 sm:py-3"
                >
                  Read today&apos;s story
                </Link>
              )}
              <Link
                href="/about"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/40 hover:text-white transition-colors sm:px-6 sm:py-3"
              >
                About Fena Daily
              </Link>
            </div>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-amber-400/5 blur-[100px]"
        />
      </section>

      {/* ── Featured Story + grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:px-8 lg:py-14">
        <SectionHeader eyebrow="Featured" title="Top Story" />

        {featuredStory ? (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Main featured card */}
            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl shadow-black/40 sm:rounded-[28px]">
              {featuredStory.image ? (
                <div className="relative h-52 w-full overflow-hidden sm:h-64 md:h-72">
                  <Image
                    src={featuredStory.image}
                    alt={featuredStory.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
                </div>
              ) : (
                <div className="h-52 w-full bg-zinc-800/60 sm:h-64 md:h-72" />
              )}
              <div className="p-5 sm:p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-medium text-amber-300 ring-1 ring-amber-400/25">
                    {featuredStory.category}
                  </span>
                  <span className="text-xs text-zinc-500">{featuredStory.publishedAt}</span>
                </div>
                <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl md:text-3xl">
                  <Link href={`/article/${featuredStory.slug}`} className="transition-colors hover:text-amber-200">
                    {featuredStory.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
                  {featuredStory.excerpt}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-zinc-400">
                    {featuredStory.author} · {featuredStory.readingTime}
                  </span>
                  <Link
                    href={`/article/${featuredStory.slug}`}
                    className="shrink-0 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
                  >
                    Read story
                  </Link>
                </div>
              </div>
            </article>

            {/* Featured grid: next top stories */}
            <aside className="flex flex-col gap-3 sm:gap-4">
              <p className="text-xs uppercase tracking-[0.4em] text-zinc-500 font-medium">More Top Stories</p>
              {featuredGrid.map((item) => (
                <Link
                  key={item.slug}
                  href={`/article/${item.slug}`}
                  className="group flex gap-3 rounded-xl border border-white/8 bg-zinc-950/70 p-3 hover:border-amber-400/30 hover:bg-zinc-900/80 transition-all duration-150 sm:gap-4 sm:rounded-2xl sm:p-4"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={64}
                      height={64}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-zinc-800/60 sm:h-16 sm:w-16" />
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-amber-300/80">{item.category}</span>
                    <h3 className="mt-0.5 text-sm font-semibold leading-snug text-white line-clamp-2 group-hover:text-amber-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">{item.readingTime}</p>
                  </div>
                </Link>
              ))}
            </aside>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 text-center sm:rounded-[28px] sm:p-8">
            <p className="text-zinc-400">No articles available yet. Check back soon.</p>
          </div>
        )}
      </section>

      {/* ── Trending + Most Read (two-column on desktop) ── */}
      {(trending.length > 0 || popular.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 pb-8 sm:pb-10 lg:px-8 lg:pb-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            {trending.length > 0 && (
              <div>
                <SectionHeader eyebrow="Trending" title="Trending Now" />
                <div className="flex flex-col gap-3">
                  {trending.map((item, i) => (
                    <StoryRow key={item.slug} article={item} rank={i + 1} />
                  ))}
                </div>
              </div>
            )}
            {popular.length > 0 && (
              <div>
                <SectionHeader eyebrow="Most Read" title="Popular This Week" />
                <div className="flex flex-col gap-3">
                  {popular.map((item, i) => (
                    <StoryRow key={item.slug} article={item} rank={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Latest Articles ── */}
      {latestGrid.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-8 sm:pb-10 lg:px-8 lg:pb-14">
          <SectionHeader eyebrow="Fresh" title="Latest Stories" />
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {latestGrid.map((item) => (
              <ArticleCard key={item.slug} article={item} />
            ))}
          </div>
        </section>
      )}

      {/* ── Category Highlights ── */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:pb-10 lg:px-8 lg:pb-14">
        <SectionHeader eyebrow="Explore" title="Browse by Topic" />
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {categoryHighlights.map(({ label, slug, count }) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-950/70 p-4 hover:border-amber-400/30 hover:bg-zinc-900/80 transition-all duration-200 sm:rounded-2xl sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors sm:text-lg">
                  {label}
                </h3>
                <span className="shrink-0 text-xs text-zinc-500">
                  {count > 0 ? `${count} article${count === 1 ? "" : "s"}` : "Coming soon"}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-400 opacity-0 transition-opacity group-hover:opacity-100 sm:mt-3">
                Browse {label} <span>→</span>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-amber-400/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100"
              />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
