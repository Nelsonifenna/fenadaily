// Adapter for Sportmonks Football API (v3). Auth via `api_token` query param.
// Docs: https://docs.sportmonks.com/football
//
// Confidence note: Sportmonks' fixture "state" IDs and season IDs are less
// universally stable than football-data.org's codes or API-Football's league
// IDs — state IDs in particular can vary by what your plan's `/core/states`
// endpoint returns. The mapping below covers the commonly documented core
// states; if matches show as "unknown" status on your account, check
// GET {base}/core/states?api_token=... and extend STATE_MAP accordingly.

import type {
  FootballProvider, Match, MatchSummary, TeamRef, CompetitionRef, Score,
  MatchStatus, StandingRow, SlugParts, TeamForm, FormResult,
} from "../types";
import { FOOTBALL_API_BASE_URL, FOOTBALL_API_KEY, WATCH_LIVE_DEFAULT_URL, REVALIDATE_FIXTURES, REVALIDATE_MATCH, REVALIDATE_STANDINGS } from "../config";
import { slugifyName, buildMatchSlug } from "../slug";
import { getCompetitionByProviderId, getCompetitionBySlug } from "../competitions";

type SMParticipant = { id: number; name: string; image_path?: string; meta?: { location?: "home" | "away" } };
type SMScoreEntry = { participant_id: number; description: string; score: { goals: number; participant: "home" | "away" } };
type SMLeague = { id: number; name: string; image_path?: string; country_id?: number };
type SMVenue = { id: number; name?: string; city_name?: string };
type SMFixture = {
  id: number;
  starting_at: string; // "YYYY-MM-DD HH:mm:ss"
  state_id: number;
  league_id: number;
  participants?: SMParticipant[];
  scores?: SMScoreEntry[];
  league?: SMLeague;
  venue?: SMVenue;
};

const STATE_MAP: Record<number, MatchStatus> = {
  1: "scheduled",   // NS
  2: "live",        // 1st half
  3: "paused",      // HT
  4: "live",        // 2nd half
  5: "finished",    // FT
  6: "live",        // ET
  7: "finished",    // FT after pens
  8: "cancelled",
  9: "postponed",
  10: "cancelled",  // interrupted
  11: "cancelled",  // abandoned
  12: "postponed",  // delayed
};

function toIsoDate(startingAt: string): string {
  return startingAt.includes("T") ? startingAt : startingAt.replace(" ", "T") + "Z";
}

function smHeaders(): Record<string, string> {
  return {};
}

async function smFetch<T>(path: string, revalidateSeconds: number, params: Record<string, string> = {}): Promise<T | null> {
  if (!FOOTBALL_API_KEY) return null;
  const query = new URLSearchParams({ api_token: FOOTBALL_API_KEY, ...params });
  const url = `${FOOTBALL_API_BASE_URL}${path}?${query.toString()}`;
  try {
    const res = await fetch(url, { headers: smHeaders(), next: { revalidate: revalidateSeconds } });
    if (!res.ok) {
      console.error(`[sportmonks] ${path} failed — ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[sportmonks] fetch error for ${path}:`, err);
    return null;
  }
}

function participantsOf(f: SMFixture): { home?: SMParticipant; away?: SMParticipant } {
  return {
    home: f.participants?.find((p) => p.meta?.location === "home"),
    away: f.participants?.find((p) => p.meta?.location === "away"),
  };
}

function toTeamRef(p: SMParticipant): TeamRef {
  return { id: String(p.id), name: p.name, slug: slugifyName(p.name), crestUrl: p.image_path };
}

function toCompetitionRef(l: SMLeague): CompetitionRef {
  const known = getCompetitionByProviderId("sportmonks", String(l.id));
  return { id: String(l.id), name: l.name, slug: known?.slug ?? slugifyName(l.name), emblemUrl: l.image_path };
}

function toScore(f: SMFixture): Score {
  const current = f.scores?.filter((s) => s.description === "CURRENT") ?? [];
  const home = current.find((s) => s.score.participant === "home")?.score.goals ?? null;
  const away = current.find((s) => s.score.participant === "away")?.score.goals ?? null;
  return { home, away };
}

function toMatchSummary(f: SMFixture): MatchSummary | null {
  const { home, away } = participantsOf(f);
  if (!home || !away || !f.league) return null;
  return {
    id: String(f.id),
    slug: buildMatchSlug(home.name, away.name, toIsoDate(f.starting_at)),
    competition: toCompetitionRef(f.league),
    kickoff: toIsoDate(f.starting_at),
    status: STATE_MAP[f.state_id] ?? "unknown",
    homeTeam: toTeamRef(home),
    awayTeam: toTeamRef(away),
    score: toScore(f),
    venue: f.venue ? { name: f.venue.name, city: f.venue.city_name } : undefined,
  };
}

function toMatchFull(f: SMFixture, summary: MatchSummary): Match {
  return {
    ...summary,
    watchLiveUrl: WATCH_LIVE_DEFAULT_URL || `/football/competition/${summary.competition.slug}`,
  };
}

async function getMatchesInRange(from: string, to: string): Promise<MatchSummary[]> {
  const data = await smFetch<{ data: SMFixture[] }>(`/fixtures/between/${from}/${to}`, REVALIDATE_FIXTURES, {
    include: "participants;scores;league;venue",
  });
  return (data?.data ?? []).map(toMatchSummary).filter((m): m is MatchSummary => m !== null);
}

async function getLiveMatches(): Promise<MatchSummary[]> {
  const data = await smFetch<{ data: SMFixture[] }>(`/livescores`, REVALIDATE_FIXTURES, {
    include: "participants;scores;league;venue",
  });
  return (data?.data ?? []).map(toMatchSummary).filter((m): m is MatchSummary => m !== null);
}

function computeFormFromRecent(team: TeamRef, recent: SMFixture[]): TeamForm {
  const results: FormResult[] = [];
  let goalsFor = 0;
  let goalsAgainst = 0;
  for (const f of recent) {
    const { home } = participantsOf(f);
    const isHome = home?.id === Number(team.id);
    const score = toScore(f);
    const gf = (isHome ? score.home : score.away) ?? 0;
    const ga = (isHome ? score.away : score.home) ?? 0;
    goalsFor += gf;
    goalsAgainst += ga;
    results.push(gf > ga ? "W" : gf < ga ? "L" : "D");
  }
  return { team, results, goalsFor, goalsAgainst };
}

async function getMatchBySlugParts(parts: SlugParts): Promise<Match | null> {
  const dateMatch = parts.dateSlug.match(/^([a-z]+)-(\d{1,2})-(\d{4})$/);
  if (!dateMatch) return null;
  const monthIndex = ["january","february","march","april","may","june","july","august","september","october","november","december"].indexOf(dateMatch[1]);
  if (monthIndex === -1) return null;
  const dateStr = `${dateMatch[3]}-${String(monthIndex + 1).padStart(2, "0")}-${String(Number(dateMatch[2])).padStart(2, "0")}`;

  const data = await smFetch<{ data: SMFixture[] }>(`/fixtures/date/${dateStr}`, REVALIDATE_MATCH, {
    include: "participants;scores;league;venue",
  });
  const candidate = (data?.data ?? []).find((f) => {
    const { home, away } = participantsOf(f);
    return home && away && slugifyName(home.name) === parts.homeSlug && slugifyName(away.name) === parts.awaySlug;
  });
  if (!candidate) return null;

  const summary = toMatchSummary(candidate);
  if (!summary) return null;
  const match = toMatchFull(candidate, summary);
  const { home, away } = participantsOf(candidate);
  if (!home || !away) return match;

  const [h2h, homeRecent, awayRecent] = await Promise.all([
    smFetch<{ data: SMFixture[] }>(`/fixtures/head-to-head/${home.id}/${away.id}`, REVALIDATE_STANDINGS, { include: "participants;scores;league" }),
    smFetch<{ data: SMFixture[] }>(`/fixtures`, REVALIDATE_FIXTURES, { include: "participants;scores;league", filters: `fixtureParticipants:${home.id}` }),
    smFetch<{ data: SMFixture[] }>(`/fixtures`, REVALIDATE_FIXTURES, { include: "participants;scores;league", filters: `fixtureParticipants:${away.id}` }),
  ]);

  if (h2h?.data?.length) {
    const meetings = h2h.data.map((f) => {
      const p = participantsOf(f);
      return {
        date: toIsoDate(f.starting_at),
        homeTeam: p.home ? toTeamRef(p.home) : match.homeTeam,
        awayTeam: p.away ? toTeamRef(p.away) : match.awayTeam,
        score: toScore(f),
        competitionName: f.league?.name,
      };
    });
    const homeWins = meetings.filter((m) => (m.score.home ?? 0) > (m.score.away ?? 0) && m.homeTeam.id === match.homeTeam.id).length
      + meetings.filter((m) => (m.score.away ?? 0) > (m.score.home ?? 0) && m.awayTeam.id === match.homeTeam.id).length;
    const awayWins = meetings.filter((m) => (m.score.home ?? 0) > (m.score.away ?? 0) && m.homeTeam.id === match.awayTeam.id).length
      + meetings.filter((m) => (m.score.away ?? 0) > (m.score.home ?? 0) && m.awayTeam.id === match.awayTeam.id).length;
    match.headToHead = { meetings, homeWins, awayWins, draws: meetings.length - homeWins - awayWins };
  }

  if (homeRecent?.data?.length) match.homeForm = computeFormFromRecent(match.homeTeam, homeRecent.data.slice(0, 5));
  if (awayRecent?.data?.length) match.awayForm = computeFormFromRecent(match.awayTeam, awayRecent.data.slice(0, 5));

  return match;
}

async function getStandings(competitionSlug: string) {
  const comp = getCompetitionBySlug(competitionSlug);
  if (!comp) return null;

  const league = await smFetch<{ data: { id: number; name: string; image_path?: string; currentseason?: { id: number } } }>(
    `/leagues/${comp.ids.sportmonks}`,
    REVALIDATE_STANDINGS,
    { include: "currentseason" }
  );
  const seasonId = league?.data?.currentseason?.id;
  if (!seasonId) return null;

  const standings = await smFetch<{ data: Array<{ position: number; participant: SMParticipant; points: number; details?: Array<{ type: { code: string }; value: number }> }> }>(
    `/standings/seasons/${seasonId}`,
    REVALIDATE_STANDINGS,
    { include: "participant" }
  );
  if (!standings?.data?.length) return null;

  const detailValue = (row: (typeof standings.data)[number], code: string) =>
    row.details?.find((d) => d.type?.code === code)?.value ?? 0;

  return {
    competition: { id: String(league.data.id), name: league.data.name, slug: comp.slug, emblemUrl: league.data.image_path },
    rows: standings.data.map((row): StandingRow => ({
      position: row.position,
      team: toTeamRef(row.participant),
      played: detailValue(row, "played"),
      won: detailValue(row, "won"),
      draw: detailValue(row, "draw"),
      lost: detailValue(row, "lost"),
      goalsFor: detailValue(row, "goals-for"),
      goalsAgainst: detailValue(row, "goals-against"),
      goalDifference: detailValue(row, "goal-difference"),
      points: row.points,
    })),
  };
}

async function getTeamMatches(teamSlug: string) {
  const today = new Date();
  const past = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  const future = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
  const [recent, upcoming] = await Promise.all([
    getMatchesInRange(past.toISOString().slice(0, 10), today.toISOString().slice(0, 10)),
    getMatchesInRange(today.toISOString().slice(0, 10), future.toISOString().slice(0, 10)),
  ]);
  const belongs = (m: MatchSummary) => m.homeTeam.slug === teamSlug || m.awayTeam.slug === teamSlug;
  const recentMatches = recent.filter(belongs);
  const upcomingMatches = upcoming.filter(belongs);
  const teamMatch = recentMatches[0] ?? upcomingMatches[0];
  if (!teamMatch) return null;
  const team = teamMatch.homeTeam.slug === teamSlug ? teamMatch.homeTeam : teamMatch.awayTeam;
  return { team, recent: recentMatches, upcoming: upcomingMatches };
}

async function getCompetitionMatches(competitionSlug: string) {
  const comp = getCompetitionBySlug(competitionSlug);
  if (!comp) return null;
  const data = await smFetch<{ data: SMFixture[] }>(`/fixtures`, REVALIDATE_FIXTURES, {
    include: "participants;scores;league;venue",
    filters: `fixtureLeagues:${comp.ids.sportmonks}`,
  });
  if (!data) return null;
  const matches = data.data.map(toMatchSummary).filter((m): m is MatchSummary => m !== null);
  return {
    competition: matches[0]?.competition ?? { id: comp.ids.sportmonks, name: comp.name, slug: comp.slug, country: comp.country },
    matches,
  };
}

export const sportmonksProvider: FootballProvider = {
  id: "sportmonks",
  getMatchesInRange,
  getLiveMatches,
  getMatchBySlugParts,
  getStandings,
  getTeamMatches,
  getCompetitionMatches,
};
