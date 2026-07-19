import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamPage } from "@/football/content";
import { buildBreadcrumbSchema } from "@/football/schema";
import { SITE_URL } from "@/football/config";
import { FootballBreadcrumb } from "@/components/football/FootballBreadcrumb";
import { FootballSubNav } from "@/components/football/FootballSubNav";
import { MatchCard } from "@/components/football/MatchCard";

export const revalidate = 900;

type Params = { team: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { team: slug } = await params;
  const data = await getTeamPage(slug);
  if (!data) return { title: "Team Not Found", robots: { index: false, follow: false } };

  const title = `${data.team.name}: Fixtures, Results & Where to Watch`;
  const description = `${data.team.name} upcoming fixtures, recent results, and kickoff times — updated automatically.`;
  const teamUrl = `${SITE_URL}/football/team/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: teamUrl },
    openGraph: { type: "website", url: teamUrl, title, description },
    twitter: { card: "summary", title, description },
  };
}

export default async function TeamPage({ params }: { params: Promise<Params> }) {
  const { team: slug } = await params;
  const data = await getTeamPage(slug);

  if (!data) {
    notFound();
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Football", url: `${SITE_URL}/football` },
    { name: data.team.name, url: `${SITE_URL}/football/team/${slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-[linear-gradient(160deg,#08111f_0%,#0d1623_50%,#020617_100%)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:px-8 lg:py-14">
          <FootballBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Football", href: "/football" }, { label: data.team.name }]} />

          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-5 py-8 shadow-2xl shadow-black/30 sm:rounded-[28px] sm:px-8 sm:py-10 md:px-12">
            <span className="text-xs uppercase tracking-[0.4em] text-amber-400 font-semibold">Team</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">{data.team.name}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Upcoming fixtures and recent results for {data.team.name}, with kickoff times and links to watch.
            </p>
          </div>

          <FootballSubNav />

          {data.upcoming.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">Upcoming Fixtures</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.upcoming.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          {data.recent.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">Recent Results</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.recent.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </section>
          )}

          {data.upcoming.length === 0 && data.recent.length === 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-12 text-center sm:rounded-[28px] sm:px-8 sm:py-16">
              <p className="text-3xl">⚽</p>
              <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">No fixtures found</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">Check back closer to {data.team.name}&apos;s next match.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
