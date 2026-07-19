import type { Metadata } from "next";
import { getTodayMatches, getLiveMatches, getUpcomingMatches } from "@/football/content";
import { buildBreadcrumbSchema } from "@/football/schema";
import { SITE_URL } from "@/football/config";
import { COMPETITIONS } from "@/football/competitions";
import { FootballBreadcrumb } from "@/components/football/FootballBreadcrumb";
import { FootballSubNav } from "@/components/football/FootballSubNav";
import { MatchCard } from "@/components/football/MatchCard";
import Link from "next/link";

export const revalidate = 300;

const DESC =
  "Live football scores, today's fixtures, kickoff times, standings, and where to watch every major match — Premier League, Champions League, La Liga, and more.";

export const metadata: Metadata = {
  title: "Football: Live Scores, Fixtures & Where to Watch",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/football` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/football`,
    title: "Football: Live Scores, Fixtures & Where to Watch | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=Football&type=category`, width: 1200, height: 630, alt: "Football" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Football: Live Scores, Fixtures & Where to Watch | Fena Daily",
    description: DESC,
    images: [`/api/og?title=Football&type=category`],
  },
};

export default async function FootballHomePage() {
  const [live, today, upcoming] = await Promise.all([
    getLiveMatches(),
    getTodayMatches(),
    getUpcomingMatches(7),
  ]);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Football", url: `${SITE_URL}/football` },
  ]);

  const configured = live.length > 0 || today.length > 0 || upcoming.length > 0;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-[linear-gradient(160deg,#08111f_0%,#0d1623_50%,#020617_100%)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:px-8 lg:py-14">
          <FootballBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Football" }]} />

          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-5 py-8 shadow-2xl shadow-black/30 sm:rounded-[28px] sm:px-8 sm:py-10 md:px-12">
            <span className="text-xs uppercase tracking-[0.4em] text-amber-400 font-semibold">Live Football</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Football: Live Scores, Fixtures &amp; Where to Watch
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Kickoff times, live scores, standings, head-to-head records and streaming links for the Premier
              League, Champions League, La Liga, Serie A, Bundesliga, Ligue 1 and more — updated automatically
              as fixtures are confirmed.
            </p>
          </div>

          <FootballSubNav />

          {!configured && (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-12 text-center sm:rounded-[28px] sm:px-8 sm:py-16">
              <p className="text-3xl">⚽</p>
              <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">Football data connecting…</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">
                Live fixtures will appear here as soon as a football data provider is configured.
              </p>
            </div>
          )}

          {live.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> Live Now
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {live.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          {today.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">Today&apos;s Matches</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {today.slice(0, 9).map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">This Week&apos;s Fixtures</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.slice(0, 9).map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">Competitions</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {COMPETITIONS.map((c) => (
                <Link
                  key={c.slug}
                  href={`/football/competition/${c.slug}`}
                  className="rounded-xl border border-white/10 bg-zinc-950/70 p-4 transition-colors hover:border-amber-400/25"
                >
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">{c.country}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
