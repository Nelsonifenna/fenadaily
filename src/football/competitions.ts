// Single source of truth for which competitions the football module covers
// and how each maps to a provider's own competition/league identifier.
// Mirrors the pattern already used for blog categories (src/lib/categories.ts):
// add a competition here once, and it becomes available across every route
// (competition pages, sitemap, standings lookups) with no other code changes.
//
// Confidence note: football-data.org codes (PL, CL, PD, ...) are stable,
// long-documented identifiers. The API-Football numeric IDs below are the
// widely-cited, community-standard IDs for these leagues. The Sportmonks IDs
// are best-effort — Sportmonks assigns IDs per your own subscription/plan in
// some cases, so if you run this module on Sportmonks, verify these against
// GET /football/leagues in your dashboard and adjust here if needed.

export type CompetitionDef = {
  slug: string;
  name: string;
  country: string;
  ids: {
    "football-data": string;
    "api-football": string;
    sportmonks: string;
  };
};

export const COMPETITIONS: CompetitionDef[] = [
  { slug: "premier-league",   name: "Premier League",        country: "England", ids: { "football-data": "PL",  "api-football": "39",  sportmonks: "8" } },
  { slug: "champions-league", name: "UEFA Champions League", country: "Europe",  ids: { "football-data": "CL",  "api-football": "2",   sportmonks: "2" } },
  { slug: "la-liga",          name: "La Liga",                country: "Spain",   ids: { "football-data": "PD",  "api-football": "140", sportmonks: "564" } },
  { slug: "bundesliga",       name: "Bundesliga",             country: "Germany", ids: { "football-data": "BL1", "api-football": "78",  sportmonks: "82" } },
  { slug: "serie-a",          name: "Serie A",                country: "Italy",   ids: { "football-data": "SA",  "api-football": "135", sportmonks: "384" } },
  { slug: "ligue-1",          name: "Ligue 1",                country: "France",  ids: { "football-data": "FL1", "api-football": "61",  sportmonks: "301" } },
  { slug: "championship",     name: "EFL Championship",       country: "England", ids: { "football-data": "ELC", "api-football": "40",  sportmonks: "9" } },
  { slug: "eredivisie",       name: "Eredivisie",             country: "Netherlands", ids: { "football-data": "DED", "api-football": "88", sportmonks: "72" } },
];

export function getCompetitionBySlug(slug: string): CompetitionDef | undefined {
  return COMPETITIONS.find((c) => c.slug === slug);
}

export function getCompetitionByProviderId(
  provider: keyof CompetitionDef["ids"],
  id: string
): CompetitionDef | undefined {
  return COMPETITIONS.find((c) => c.ids[provider] === String(id));
}
