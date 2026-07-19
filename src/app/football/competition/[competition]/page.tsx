import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompetitionPage, getStandingsForCompetition } from "@/football/content";
import { getCompetitionBySlug } from "@/football/competitions";
import { buildBreadcrumbSchema } from "@/football/schema";
import { SITE_URL } from "@/football/config";
import { FootballBreadcrumb } from "@/components/football/FootballBreadcrumb";
import { FootballSubNav } from "@/components/football/FootballSubNav";
import { MatchCard } from "@/components/football/MatchCard";
import { StandingsTable } from "@/components/football/StandingsTable";

export const revalidate = 900;

type Params = { competition: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { competition: slug } = await params;
  const comp = getCompetitionBySlug(slug);
  if (!comp) return { title: "Competition Not Found", robots: { index: false, follow: false } };

  const title = `${comp.name}: Fixtures, Standings & Live Scores`;
  const description = `${comp.name} fixtures, live scores, and the current standings table — updated automatically.`;
  const compUrl = `${SITE_URL}/football/competition/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: compUrl },
    openGraph: {
      type: "website",
      url: compUrl,
      title,
      description,
      images: [{ url: `/api/og?title=${encodeURIComponent(comp.name)}&type=category`, width: 1200, height: 630, alt: comp.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(comp.name)}&type=category`],
    },
  };
}

export default async function CompetitionPage({ params }: { params: Promise<Params> }) {
  const { competition: slug } = await params;
  const comp = getCompetitionBySlug(slug);
  if (!comp) {
    notFound();
  }

  const [matchesData, standingsData] = await Promise.all([
    getCompetitionPage(slug),
    getStandingsForCompetition(slug),
  ]);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Football", url: `${SITE_URL}/football` },
    { name: comp.name, url: `${SITE_URL}/football/competition/${slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-[linear-gradient(160deg,#08111f_0%,#0d1623_50%,#020617_100%)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:px-8 lg:py-14">
          <FootballBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Football", href: "/football" }, { label: comp.name }]} />

          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-5 py-8 shadow-2xl shadow-black/30 sm:rounded-[28px] sm:px-8 sm:py-10 md:px-12">
            <span className="text-xs uppercase tracking-[0.4em] text-amber-400 font-semibold">{comp.country}</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">{comp.name}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Upcoming fixtures and the current {comp.name} table, with kickoff times and live scores.
            </p>
          </div>

          <FootballSubNav />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <section>
              <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">Upcoming Fixtures</h2>
              {matchesData && matchesData.matches.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {matchesData.matches.map((m) => <MatchCard key={m.id} match={m} />)}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-10 text-center">
                  <p className="text-sm text-zinc-400">No upcoming fixtures found right now — check back soon.</p>
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">Table</h2>
              {standingsData && standingsData.rows.length > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4 shadow-xl shadow-black/20">
                  <StandingsTable rows={standingsData.rows} />
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-10 text-center">
                  <p className="text-sm text-zinc-400">Standings aren&apos;t available yet.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
