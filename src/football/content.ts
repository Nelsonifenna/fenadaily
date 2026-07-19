// Resilient data-access layer for the football module — every page imports
// from here, never from a provider adapter directly. Mirrors the existing
// blog's src/lib/content.ts pattern: thin, typed wrappers that never throw,
// so a provider hiccup degrades a page to an empty state instead of a 500.

import type { Match, MatchSummary, StandingRow, CompetitionRef, TeamRef } from "./types";
import { getFootballProvider } from "./providers";
import { parseMatchSlug, toApiDate } from "./slug";
import { isFootballConfigured } from "./config";

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export async function getTodayMatches(): Promise<MatchSummary[]> {
  if (!isFootballConfigured()) return [];
  try {
    const today = toApiDate(new Date());
    return await getFootballProvider().getMatchesInRange(today, today);
  } catch (err) {
    console.error("[football] getTodayMatches failed:", err);
    return [];
  }
}

export async function getMatchesForDateSlug(dateSlug: string): Promise<MatchSummary[]> {
  if (!isFootballConfigured()) return [];
  const parsed = dateSlug.match(/^([a-z]+)-(\d{1,2})-(\d{4})$/);
  if (!parsed) return [];
  const monthIndex = ["january","february","march","april","may","june","july","august","september","october","november","december"].indexOf(parsed[1]);
  if (monthIndex === -1) return [];
  const dateStr = `${parsed[3]}-${String(monthIndex + 1).padStart(2, "0")}-${String(Number(parsed[2])).padStart(2, "0")}`;
  try {
    return await getFootballProvider().getMatchesInRange(dateStr, dateStr);
  } catch (err) {
    console.error(`[football] getMatchesForDateSlug("${dateSlug}") failed:`, err);
    return [];
  }
}

export async function getUpcomingMatches(days = 7): Promise<MatchSummary[]> {
  if (!isFootballConfigured()) return [];
  try {
    const from = toApiDate(new Date());
    const to = toApiDate(daysFromNow(days));
    return await getFootballProvider().getMatchesInRange(from, to);
  } catch (err) {
    console.error("[football] getUpcomingMatches failed:", err);
    return [];
  }
}

export async function getLiveMatches(): Promise<MatchSummary[]> {
  if (!isFootballConfigured()) return [];
  try {
    return await getFootballProvider().getLiveMatches();
  } catch (err) {
    console.error("[football] getLiveMatches failed:", err);
    return [];
  }
}

export async function getMatchBySlug(slug: string): Promise<Match | null> {
  if (!isFootballConfigured()) return null;
  const parts = parseMatchSlug(slug);
  if (!parts) return null;
  try {
    return await getFootballProvider().getMatchBySlugParts(parts);
  } catch (err) {
    console.error(`[football] getMatchBySlug("${slug}") failed:`, err);
    return null;
  }
}

export async function getStandingsForCompetition(
  competitionSlug: string
): Promise<{ competition: CompetitionRef; rows: StandingRow[] } | null> {
  if (!isFootballConfigured()) return null;
  try {
    return await getFootballProvider().getStandings(competitionSlug);
  } catch (err) {
    console.error(`[football] getStandingsForCompetition("${competitionSlug}") failed:`, err);
    return null;
  }
}

export async function getTeamPage(
  teamSlug: string
): Promise<{ team: TeamRef; upcoming: MatchSummary[]; recent: MatchSummary[] } | null> {
  if (!isFootballConfigured()) return null;
  try {
    return await getFootballProvider().getTeamMatches(teamSlug);
  } catch (err) {
    console.error(`[football] getTeamPage("${teamSlug}") failed:`, err);
    return null;
  }
}

export async function getCompetitionPage(
  competitionSlug: string
): Promise<{ competition: CompetitionRef; matches: MatchSummary[] } | null> {
  if (!isFootballConfigured()) return null;
  try {
    return await getFootballProvider().getCompetitionMatches(competitionSlug);
  } catch (err) {
    console.error(`[football] getCompetitionPage("${competitionSlug}") failed:`, err);
    return null;
  }
}

// Used by the main sitemap (src/app/sitemap.ts) to automatically list every
// match page currently worth indexing: recently finished (still useful for
// "result" searches) through two weeks out (fixture/"where to watch"
// searches). No manual publishing step — whatever the provider returns here
// is what gets crawled.
export async function getSitemapMatches(): Promise<MatchSummary[]> {
  if (!isFootballConfigured()) return [];
  try {
    const from = toApiDate(daysFromNow(-3));
    const to = toApiDate(daysFromNow(14));
    return await getFootballProvider().getMatchesInRange(from, to);
  } catch (err) {
    console.error("[football] getSitemapMatches failed:", err);
    return [];
  }
}
