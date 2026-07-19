import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMatchBySlug, getCompetitionPage } from "@/football/content";
import { generateMatchPreview, generateFAQs } from "@/football/generate";
import { buildSportsEventSchema, buildBreadcrumbSchema, buildFAQSchema } from "@/football/schema";
import { SITE_URL } from "@/football/config";
import { FootballBreadcrumb } from "@/components/football/FootballBreadcrumb";
import { MatchStatusBadge } from "@/components/football/MatchStatusBadge";
import { WatchLiveButton } from "@/components/football/WatchLiveButton";
import { StandingsTable } from "@/components/football/StandingsTable";
import { H2HList } from "@/components/football/H2HList";
import { MatchFAQ } from "@/components/football/MatchFAQ";
import { MatchCard } from "@/components/football/MatchCard";
import { getPostsByCategory } from "@/lib/wordpress";

export const revalidate = 300;

type Params = { match: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { match: slug } = await params;
  const match = await getMatchBySlug(slug);

  if (!match) {
    return { title: "Match Not Found", robots: { index: false, follow: false } };
  }

  const title = `${match.homeTeam.name} vs ${match.awayTeam.name}: Watch Live, Kickoff Time & Preview`;
  const description = `${match.homeTeam.name} vs ${match.awayTeam.name} — ${match.competition.name} kickoff time, team news, head-to-head record, standings and where to watch live.`;
  const matchUrl = `${SITE_URL}/football/watch/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: matchUrl },
    openGraph: {
      type: "website",
      url: matchUrl,
      title,
      description,
      images: [{ url: `/api/og?title=${encodeURIComponent(`${match.homeTeam.name} vs ${match.awayTeam.name}`)}&category=${encodeURIComponent(match.competition.name)}&type=article`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(`${match.homeTeam.name} vs ${match.awayTeam.name}`)}&category=${encodeURIComponent(match.competition.name)}&type=article`],
    },
  };
}

export default async function MatchPage({ params }: { params: Promise<Params> }) {
  const { match: slug } = await params;
  const match = await getMatchBySlug(slug);

  if (!match) {
    notFound();
  }

  const matchUrl = `${SITE_URL}/football/watch/${slug}`;
  const preview = generateMatchPreview(match);
  const faqs = generateFAQs(match);

  const [competitionData, relatedArticles] = await Promise.all([
    getCompetitionPage(match.competition.slug),
    getPostsByCategory("football", 3),
  ]);

  const relatedMatches = (competitionData?.matches ?? [])
    .filter((m) => m.id !== match.id)
    .slice(0, 4);

  const kickoffDate = new Date(match.kickoff);
  const dateLabel = kickoffDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeLabel = kickoffDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      buildSportsEventSchema(match, matchUrl),
      buildBreadcrumbSchema([
        { name: "Home", url: SITE_URL },
        { name: "Football", url: `${SITE_URL}/football` },
        { name: match.competition.name, url: `${SITE_URL}/football/competition/${match.competition.slug}` },
        { name: `${match.homeTeam.name} vs ${match.awayTeam.name}`, url: matchUrl },
      ]),
      buildFAQSchema(faqs),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10 lg:px-8">
          <FootballBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Football", href: "/football" },
              { label: match.competition.name, href: `/football/competition/${match.competition.slug}` },
              { label: `${match.homeTeam.name} vs ${match.awayTeam.name}` },
            ]}
          />

          <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 ring-1 ring-amber-400/25">
                {match.competition.name}
              </span>
              <MatchStatusBadge status={match.status} minute={match.minute} />
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-3xl md:text-4xl">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </h1>
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              {dateLabel} · Kickoff {timeLabel}
              {match.venue?.name ? ` · ${match.venue.name}${match.venue.city ? `, ${match.venue.city}` : ""}` : ""}
            </p>

            {(match.score.home !== null || match.status !== "scheduled") && (
              <div className="mt-6 flex items-center justify-center gap-6 rounded-2xl bg-white/5 py-6">
                <span className="text-lg font-semibold text-white sm:text-xl">{match.homeTeam.name}</span>
                <span className="text-3xl font-black text-white sm:text-4xl">
                  {match.score.home ?? "–"} : {match.score.away ?? "–"}
                </span>
                <span className="text-lg font-semibold text-white sm:text-xl">{match.awayTeam.name}</span>
              </div>
            )}

            <div className="mt-6">
              <WatchLiveButton href={match.watchLiveUrl} />
            </div>

            {/* Match preview */}
            <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm leading-relaxed text-zinc-300 sm:text-base">
              <h2 className="text-lg font-bold text-white sm:text-xl">Match Preview</h2>
              {preview.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {match.referee && (
                <p className="text-xs text-zinc-500">Referee: {match.referee}</p>
              )}
            </div>

            {/* Lineups (only when the provider supplies them) */}
            {(match.lineups?.home || match.lineups?.away) && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <h2 className="text-lg font-bold text-white sm:text-xl">Predicted Lineups</h2>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  {[match.lineups.home, match.lineups.away].filter(Boolean).map((lineup) => (
                    <div key={lineup!.team.id}>
                      <p className="text-sm font-semibold text-amber-300">{lineup!.team.name}{lineup!.formation ? ` (${lineup!.formation})` : ""}</p>
                      <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                        {lineup!.startingXI.map((p, i) => (
                          <li key={i}>{p.shirtNumber ? `${p.shirtNumber}. ` : ""}{p.name}{p.position ? ` (${p.position})` : ""}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!match.lineups?.home && !match.lineups?.away && match.status === "scheduled" && (
              <p className="mt-8 border-t border-white/10 pt-6 text-sm text-zinc-500">
                Confirmed lineups are typically published shortly before kickoff.
              </p>
            )}

            {/* Head-to-head */}
            {match.headToHead && match.headToHead.meetings.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <h2 className="text-lg font-bold text-white sm:text-xl">Head-to-Head</h2>
                <div className="mt-4">
                  <H2HList h2h={match.headToHead} />
                </div>
              </div>
            )}

            {/* Standings */}
            {match.standings && match.standings.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <h2 className="text-lg font-bold text-white sm:text-xl">{match.competition.name} Table</h2>
                <div className="mt-4">
                  <StandingsTable rows={match.standings} highlightTeamIds={[match.homeTeam.id, match.awayTeam.id]} />
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <h2 className="text-lg font-bold text-white sm:text-xl">Frequently Asked Questions</h2>
              <div className="mt-4">
                <MatchFAQ faqs={faqs} />
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <WatchLiveButton href={match.watchLiveUrl} />
            </div>
          </div>

          {/* Related matches */}
          {relatedMatches.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold text-white">More from {match.competition.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          )}

          {/* Related blog articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold text-white">Related Football Articles</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedArticles.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/article/${a.slug}`}
                    className="rounded-xl border border-white/10 bg-zinc-950/70 p-4 transition-colors hover:border-amber-400/25"
                  >
                    <p className="text-sm font-semibold leading-snug text-white">{a.title}</p>
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{a.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
