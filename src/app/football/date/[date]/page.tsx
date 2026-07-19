import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMatchesForDateSlug } from "@/football/content";
import { buildBreadcrumbSchema } from "@/football/schema";
import { SITE_URL } from "@/football/config";
import { FootballBreadcrumb } from "@/components/football/FootballBreadcrumb";
import { FootballSubNav } from "@/components/football/FootballSubNav";
import { MatchCard } from "@/components/football/MatchCard";

export const revalidate = 900;

type Params = { date: string };

const DATE_SLUG_RE = /^[a-z]+-\d{1,2}-\d{4}$/;

function formatDateSlugLabel(dateSlug: string): string | null {
  const match = dateSlug.match(/^([a-z]+)-(\d{1,2})-(\d{4})$/);
  if (!match) return null;
  const month = match[1][0].toUpperCase() + match[1].slice(1);
  return `${month} ${match[2]}, ${match[3]}`;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { date } = await params;
  const label = formatDateSlugLabel(date);
  if (!label) return { title: "Not Found", robots: { index: false, follow: false } };

  const title = `Football Matches on ${label}`;
  const description = `Every football fixture scheduled for ${label} — kickoff times, competitions, and where to watch.`;
  const dateUrl = `${SITE_URL}/football/date/${date}`;

  return {
    title,
    description,
    alternates: { canonical: dateUrl },
    openGraph: { type: "website", url: dateUrl, title, description },
    twitter: { card: "summary", title, description },
  };
}

export default async function DatePage({ params }: { params: Promise<Params> }) {
  const { date } = await params;
  if (!DATE_SLUG_RE.test(date)) {
    notFound();
  }

  const label = formatDateSlugLabel(date);
  if (!label) {
    notFound();
  }

  const matches = await getMatchesForDateSlug(date);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Football", url: `${SITE_URL}/football` },
    { name: label, url: `${SITE_URL}/football/date/${date}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-[linear-gradient(160deg,#08111f_0%,#0d1623_50%,#020617_100%)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:px-8 lg:py-14">
          <FootballBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Football", href: "/football" }, { label }]} />

          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-5 py-8 shadow-2xl shadow-black/30 sm:rounded-[28px] sm:px-8 sm:py-10 md:px-12">
            <span className="text-xs uppercase tracking-[0.4em] text-amber-400 font-semibold">Fixtures</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">Football on {label}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              {matches.length > 0
                ? `${matches.length} match${matches.length === 1 ? "" : "es"} scheduled for ${label}.`
                : `No fixtures found for ${label} in the competitions we cover.`}
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
              <h2 className="mt-4 text-lg font-semibold text-white sm:text-xl">No matches found</h2>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
