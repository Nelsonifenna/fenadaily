// Adapter for football-data.org (v4). Default provider — generous free tier,
// stable well-documented schema. Auth via `X-Auth-Token` header.
// Docs: https://docs.football-data.org/

import type {
  FootballProvider, Match, MatchSummary, TeamRef, CompetitionRef, Score,
  MatchStatus, StandingRow, HeadToHead, HeadToHeadMeeting, SlugParts, TeamForm, FormResult,
} from "../types";
import { FOOTBALL_API_BASE_URL, FOOTBALL_API_KEY, WATCH_LIVE_DEFAULT_URL, REVALIDATE_FIXTURES, REVALIDATE_MATCH, REVALIDATE_STANDINGS } from "../config";
import { slugifyName, buildMatchSlug } from "../slug";
import { getCompetitionByProviderId, getCompetitionBySlug } from "../competitions";

type FDTeam = { id: number; name: string; shortName?: string; tla?: string; crest?: string };
type FDCompetition = { id: number; name: string; code?: string; emblem?: string; area?: { name?: string } };
type FDScore = { fullTime?: { home: number | null; away: number | null }; halfTime?: { home: number | null; away: number | null } };
type FDReferee = { name?: string };
type FDMatch = {
  id: number;
  utcDate: string;
  status: string;
  matchday?: number;
  competition: FDCompetition;
  season?: { id: number };
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: FDScore;
  referees?: FDReferee[];
  venue?: string;
};

// football-data.org's free tier caps requests at 10/minute and reports
// remaining quota on every response via `X-Requests-Available-Minute` and
// the seconds-until-reset via `X-RequestCounter-Reset` (see the Quickstart
// Guide: https://docs.football-data.org/general/v4/quickstart.html). We
// remember the last values we saw and, once they say quota is exhausted for
// the current window, skip firing further requests entirely until it
// resets — rather than sending calls we already know the API will reject.
let rateLimitState: { remaining: number | null; resetAt: number } = { remaining: null, resetAt: 0 };

function recordRateLimit(res: Response): void {
  const remainingHeader = res.headers.get("X-Requests-Available-Minute");
  if (remainingHeader === null) return;
  const remaining = Number(remainingHeader);
  if (Number.isNaN(remaining)) return;

  const resetHeader = res.headers.get("X-RequestCounter-Reset");
  const resetInSeconds = resetHeader !== null && !Number.isNaN(Number(resetHeader)) ? Number(resetHeader) : 60;

  rateLimitState = { remaining, resetAt: Date.now() + resetInSeconds * 1000 };
}

function isRateLimited(): boolean {
  if (rateLimitState.remaining === null) return false;
  if (Date.now() >= rateLimitState.resetAt) return false; // window has rolled over since we last checked
  return rateLimitState.remaining <= 0;
}

async function fdFetch<T>(path: string, revalidateSeconds: number): Promise<T | null> {
  if (!FOOTBALL_API_KEY) return null;

  if (isRateLimited()) {
    const retryInSeconds = Math.ceil((rateLimitState.resetAt - Date.now()) / 1000);
    console.warn(`[football-data] Skipping ${path} — request quota exhausted for this minute (resets in ~${retryInSeconds}s).`);
    return null;
  }

  const url = `${FOOTBALL_API_BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "X-Auth-Token": FOOTBALL_API_KEY },
      next: { revalidate: revalidateSeconds },
    });

    recordRateLimit(res);

    if (res.status === 429) {
      console.error(`[football-data] Rate limited (429) on ${path} — backing off until the quota resets.`);
      return null;
    }
    if (!res.ok) {
      console.error(`[football-data] ${path} failed — ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[football-data] fetch error for ${path}:`, err);
    return null;
  }
}

function mapStatus(status: string): MatchStatus {
  switch (status) {
    case "SCHEDULED":
    case "TIMED":       return "scheduled";
    case "LIVE":
    case "IN_PLAY":      return "live";
    case "PAUSED":       return "paused";
    case "FINISHED":     return "finished";
    case "POSTPONED":    return "postponed";
    case "SUSPENDED":
    case "CANCELLED":    return "cancelled";
    default:             return "unknown";
  }
}

function toTeamRef(t: FDTeam): TeamRef {
  return { id: String(t.id), name: t.name, shortName: t.shortName ?? t.tla, slug: slugifyName(t.name), crestUrl: t.crest };
}

function toCompetitionRef(c: FDCompetition): CompetitionRef {
  const known = getCompetitionByProviderId("football-data", c.code ?? String(c.id));
  return {
    id: String(c.id),
    name: c.name,
    slug: known?.slug ?? slugifyName(c.name),
    country: c.area?.name,
    emblemUrl: c.emblem,
  };
}

function toScore(s: FDScore): Score {
  return {
    home: s.fullTime?.home ?? null,
    away: s.fullTime?.away ?? null,
    halfTimeHome: s.halfTime?.home ?? null,
    halfTimeAway: s.halfTime?.away ?? null,
  };
}

function toMatchSummary(m: FDMatch): MatchSummary {
  return {
    id: String(m.id),
    slug: buildMatchSlug(m.homeTeam.name, m.awayTeam.name, m.utcDate),
    competition: toCompetitionRef(m.competition),
    kickoff: m.utcDate,
    status: mapStatus(m.status),
    homeTeam: toTeamRef(m.homeTeam),
    awayTeam: toTeamRef(m.awayTeam),
    score: toScore(m.score),
    venue: m.venue ? { name: m.venue } : undefined,
  };
}

function toMatchFull(m: FDMatch): Match {
  return {
    ...toMatchSummary(m),
    matchday: m.matchday,
    season: m.season ? String(m.season.id) : undefined,
    referee: m.referees?.find((r) => r.name)?.name,
    watchLiveUrl: WATCH_LIVE_DEFAULT_URL || `/football/competition/${toCompetitionRef(m.competition).slug}`,
  };
}

async function getMatchesInRange(from: string, to: string): Promise<MatchSummary[]> {
  const data = await fdFetch<{ matches: FDMatch[] }>(`/matches?dateFrom=${from}&dateTo=${to}`, REVALIDATE_FIXTURES);
  return data?.matches?.map(toMatchSummary) ?? [];
}

async function getLiveMatches(): Promise<MatchSummary[]> {
  const today = new Date().toISOString().slice(0, 10);
  const matches = await getMatchesInRange(today, today);
  return matches.filter((m) => m.status === "live" || m.status === "paused");
}

function computeFormFromRecent(team: TeamRef, recent: FDMatch[]): TeamForm {
  const results: FormResult[] = [];
  let goalsFor = 0;
  let goalsAgainst = 0;
  for (const m of recent) {
    const isHome = String(m.homeTeam.id) === team.id;
    const gf = (isHome ? m.score.fullTime?.home : m.score.fullTime?.away) ?? 0;
    const ga = (isHome ? m.score.fullTime?.away : m.score.fullTime?.home) ?? 0;
    goalsFor += gf;
    goalsAgainst += ga;
    results.push(gf > ga ? "W" : gf < ga ? "L" : "D");
  }
  return { team, results, goalsFor, goalsAgainst };
}

async function getMatchBySlugParts(parts: SlugParts): Promise<Match | null> {
  // football-data has no direct "find by slug" endpoint, so we resolve the
  // calendar date from the slug and scan that day's matches for the pairing.
  const dateMatch = parts.dateSlug.match(/^([a-z]+)-(\d{1,2})-(\d{4})$/);
  if (!dateMatch) return null;
  const monthIndex = ["january","february","march","april","may","june","july","august","september","october","november","december"].indexOf(dateMatch[1]);
  if (monthIndex === -1) return null;
  const day = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);
  const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const data = await fdFetch<{ matches: FDMatch[] }>(`/matches?dateFrom=${dateStr}&dateTo=${dateStr}`, REVALIDATE_MATCH);
  const candidate = data?.matches?.find(
    (m) => slugifyName(m.homeTeam.name) === parts.homeSlug && slugifyName(m.awayTeam.name) === parts.awaySlug
  );
  if (!candidate) return null;

  const match = toMatchFull(candidate);

  // Best-effort enrichment — each call degrades independently so a failure
  // in one (e.g. head-to-head not permitted on your plan) never blocks the
  // page from rendering with everything else it does have.
  const [detail, h2h, standings, homeRecent, awayRecent] = await Promise.all([
    fdFetch<FDMatch>(`/matches/${candidate.id}`, REVALIDATE_MATCH),
    fdFetch<{ aggregates: { homeTeam: { wins: number }; awayTeam: { wins: number }; draws?: number }; matches: FDMatch[] }>(`/matches/${candidate.id}/head2head?limit=10`, REVALIDATE_STANDINGS),
    fdFetch<{ standings: { type: string; table: Array<{ position: number; team: FDTeam; playedGames: number; won: number; draw: number; lost: number; goalsFor: number; goalsAgainst: number; goalDifference: number; points: number }> }[] }>(`/competitions/${candidate.competition.id}/standings`, REVALIDATE_STANDINGS),
    fdFetch<{ matches: FDMatch[] }>(`/teams/${candidate.homeTeam.id}/matches?status=FINISHED&limit=5`, REVALIDATE_FIXTURES),
    fdFetch<{ matches: FDMatch[] }>(`/teams/${candidate.awayTeam.id}/matches?status=FINISHED&limit=5`, REVALIDATE_FIXTURES),
  ]);

  if (detail?.referees?.length) {
    match.referee = detail.referees.find((r) => r.name)?.name ?? match.referee;
  }

  if (h2h?.matches?.length) {
    const meetings: HeadToHeadMeeting[] = h2h.matches.map((m) => ({
      date: m.utcDate,
      homeTeam: toTeamRef(m.homeTeam),
      awayTeam: toTeamRef(m.awayTeam),
      score: toScore(m.score),
      competitionName: m.competition?.name,
    }));
    const record: HeadToHead = {
      meetings,
      homeWins: h2h.aggregates?.homeTeam?.wins ?? 0,
      awayWins: h2h.aggregates?.awayTeam?.wins ?? 0,
      draws: h2h.aggregates?.draws ?? Math.max(0, meetings.length - (h2h.aggregates?.homeTeam?.wins ?? 0) - (h2h.aggregates?.awayTeam?.wins ?? 0)),
    };
    match.headToHead = record;
  }

  if (standings?.standings?.length) {
    const table = standings.standings.find((s) => s.type === "TOTAL")?.table ?? standings.standings[0]?.table ?? [];
    match.standings = table.map((row): StandingRow => ({
      position: row.position,
      team: toTeamRef(row.team),
      played: row.playedGames,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points,
    }));
  }

  if (homeRecent?.matches?.length) {
    match.homeForm = computeFormFromRecent(match.homeTeam, homeRecent.matches);
  }
  if (awayRecent?.matches?.length) {
    match.awayForm = computeFormFromRecent(match.awayTeam, awayRecent.matches);
  }

  return match;
}

async function getStandings(competitionSlug: string) {
  const comp = getCompetitionBySlug(competitionSlug);
  if (!comp) return null;
  const data = await fdFetch<{ competition: FDCompetition; standings: { type: string; table: Array<{ position: number; team: FDTeam; playedGames: number; won: number; draw: number; lost: number; goalsFor: number; goalsAgainst: number; goalDifference: number; points: number }> }[] }>(
    `/competitions/${comp.ids["football-data"]}/standings`,
    REVALIDATE_STANDINGS
  );
  if (!data) return null;
  const table = data.standings.find((s) => s.type === "TOTAL")?.table ?? data.standings[0]?.table ?? [];
  return {
    competition: toCompetitionRef(data.competition),
    rows: table.map((row): StandingRow => ({
      position: row.position,
      team: toTeamRef(row.team),
      played: row.playedGames,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points,
    })),
  };
}

async function getTeamMatches(teamSlug: string) {
  // football-data has no "find team by name" search endpoint on the free
  // tier, so team pages resolve the team from whichever fixtures/results
  // currently reference that slug (populated the first time any match
  // involving that team is fetched elsewhere on the site).
  const today = new Date();
  const past = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  const future = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
  const [recentData, upcomingData] = await Promise.all([
    fdFetch<{ matches: FDMatch[] }>(`/matches?dateFrom=${past.toISOString().slice(0,10)}&dateTo=${today.toISOString().slice(0,10)}`, REVALIDATE_FIXTURES),
    fdFetch<{ matches: FDMatch[] }>(`/matches?dateFrom=${today.toISOString().slice(0,10)}&dateTo=${future.toISOString().slice(0,10)}`, REVALIDATE_FIXTURES),
  ]);

  const allMatches = [...(recentData?.matches ?? []), ...(upcomingData?.matches ?? [])];
  const teamMatch = allMatches.find(
    (m) => slugifyName(m.homeTeam.name) === teamSlug || slugifyName(m.awayTeam.name) === teamSlug
  );
  if (!teamMatch) return null;
  const team = slugifyName(teamMatch.homeTeam.name) === teamSlug ? toTeamRef(teamMatch.homeTeam) : toTeamRef(teamMatch.awayTeam);

  const belongsToTeam = (m: FDMatch) => slugifyName(m.homeTeam.name) === teamSlug || slugifyName(m.awayTeam.name) === teamSlug;

  return {
    team,
    recent: (recentData?.matches ?? []).filter(belongsToTeam).map(toMatchSummary),
    upcoming: (upcomingData?.matches ?? []).filter(belongsToTeam).map(toMatchSummary),
  };
}

async function getCompetitionMatches(competitionSlug: string) {
  const comp = getCompetitionBySlug(competitionSlug);
  if (!comp) return null;
  const data = await fdFetch<{ competition: FDCompetition; matches: FDMatch[] }>(
    `/competitions/${comp.ids["football-data"]}/matches?status=SCHEDULED`,
    REVALIDATE_FIXTURES
  );
  if (!data) return null;
  return {
    competition: toCompetitionRef(data.competition),
    matches: data.matches.map(toMatchSummary),
  };
}

export const footballDataProvider: FootballProvider = {
  id: "football-data",
  getMatchesInRange,
  getLiveMatches,
  getMatchBySlugParts,
  getStandings,
  getTeamMatches,
  getCompetitionMatches,
};
