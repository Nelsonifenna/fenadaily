import type { Metadata } from "next";
import { getTodayMatches } from "@/football/content";
import { buildBreadcrumbSchema } from "@/football/schema";
import { SITE_URL } from "@/football/config";
import { FootballBreadcrumb } from "@/components/football/FootballBreadcrumb";
import { FootballSubNav } from "@/components/football/FootballSubNav";
import { MatchCard } from "@/components/football/MatchCard";

export const revalidate = 300;

const DESC = "Every football match on today, with kickoff times, competitions, and live scores as they happen.";

export const metadata: Metadata = {
  title: "Today's Football Matches & Kickoff Times",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/football/today` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/football/today`,
    title: "Today's Football Matches & Kickoff Times | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=Today%27s+Football&type=category`, width: 1200, height: 630, alt: "Today's Football" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Today's Football Matches & Kickoff Times | Fena Daily",
    description: DESC,
    images: [`/api/og?title=Today%27s+Football&type=category`],
  },
};

export default async function TodayFootballPage() {
  const matches = await getTodayMatches();
  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Football", url: `${SITE_URL}/football` },
    { name: "Today", url: `${SITE_URL}/football/today` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-[linear-gradient(160deg,#08111f_0%,#0d1623_50%,#020617_100%)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:px-8 lg:py-14">
          <FootballBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Football", href: "/football" }, { label: "Today" }]} />

          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-5 py-8 shadow-2xl shadow-black/30 sm:rounded-[28px] sm:px-8 sm:py-10 md:px-12">
            <span className="text-xs uppercase tracking-[0.4em] text-amber-400 font-semibold">{todayLabel}</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">Today&apos;s Football Matches</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              {matches.length > 0
                ? `${matches.length} match${matches.length === 1 ? "" : "es"} scheduled today across the competitions we cover.`
                : "No fixtures scheduled today in the competitions we cover — check back tomorrow."}
            </p>
          </div>

          <FootballSubNav />

          {matches.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-12 text-center sm:rounded-[28px] sm:px-8 sm:py-16">
              <p className="text-3xl">⚽</p>
              <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">No matches today</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">Check the competition pages for upcoming fixtures.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
