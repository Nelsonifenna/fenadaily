import type { Metadata } from "next";
import { getLiveMatches } from "@/football/content";
import { buildBreadcrumbSchema } from "@/football/schema";
import { SITE_URL } from "@/football/config";
import { FootballBreadcrumb } from "@/components/football/FootballBreadcrumb";
import { FootballSubNav } from "@/components/football/FootballSubNav";
import { MatchCard } from "@/components/football/MatchCard";
import Link from "next/link";

export const revalidate = 60;

const DESC = "Every football match being played live right now — scores updating automatically, with a direct link to watch each game.";

export const metadata: Metadata = {
  title: "Live Football Scores Right Now",
  description: DESC,
  alternates: { canonical: `${SITE_URL}/football/live` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/football/live`,
    title: "Live Football Scores Right Now | Fena Daily",
    description: DESC,
    images: [{ url: `/api/og?title=Live+Football&type=category`, width: 1200, height: 630, alt: "Live Football" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Football Scores Right Now | Fena Daily",
    description: DESC,
    images: [`/api/og?title=Live+Football&type=category`],
  },
};

export default async function LiveFootballPage() {
  const live = await getLiveMatches();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Football", url: `${SITE_URL}/football` },
    { name: "Live", url: `${SITE_URL}/football/live` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-[linear-gradient(160deg,#08111f_0%,#0d1623_50%,#020617_100%)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:px-8 lg:py-14">
          <FootballBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Football", href: "/football" }, { label: "Live" }]} />

          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-5 py-8 shadow-2xl shadow-black/30 sm:rounded-[28px] sm:px-8 sm:py-10 md:px-12">
            <span className="text-xs uppercase tracking-[0.4em] text-amber-400 font-semibold">Right Now</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">Live Football Scores</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              {live.length > 0
                ? `${live.length} match${live.length === 1 ? "" : "es"} in progress right now.`
                : "No matches are being played at this exact moment — check today's full schedule below."}
            </p>
          </div>

          <FootballSubNav />

          {live.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-12 text-center sm:rounded-[28px] sm:px-8 sm:py-16">
              <p className="text-3xl">⚽</p>
              <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">Nothing kicking off this second</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">
                This page updates automatically the moment a match goes live.
              </p>
              <Link
                href="/football/today"
                className="mt-8 inline-flex rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
              >
                See today&apos;s fixtures →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
