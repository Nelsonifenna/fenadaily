// Adapter for API-Football (api-sports.io / RapidAPI). v3.
// Docs: https://www.api-football.com/documentation-v3
//
// Supports both hosting options:
//  - direct api-sports.io host → auth via `x-apisports-key`
//  - RapidAPI host (FOOTBALL_API_BASE_URL containing "rapidapi.com") →
//    auth via `x-rapidapi-key` + `x-rapidapi-host`

import type {
  FootballProvider, Match, MatchSummary, TeamRef, CompetitionRef, Score,
  MatchStatus, StandingRow, SlugParts, TeamForm, FormResult,
} from "../types";
import { FOOTBALL_API_BASE_URL, FOOTBALL_API_KEY, WATCH_LIVE_DEFAULT_URL, REVALIDATE_FIXTURES, REVALIDATE_MATCH, REVALIDATE_STANDINGS } from "../config";
import { slugifyName, buildMatchSlug } from "../slug";
import { getCompetitionByProviderId, getCompetitionBySlug } from "../competitions";

type AFTeam = { id: number; name: string; logo?: string };
type AFVenue = { name?: string; city?: string };
type AFFixture = {
  fixture: { id: number; date: string; referee?: string | null; venue?: AFVenue; status: { short: string; elapsed?: number | null } };
  league: { id: number; name: string; country?: string; logo?: string; round?: string; season: number };
  teams: { home: AFTeam; away: AFTeam };
  goals: { home: number | null; away: number | null };
  score: { halftime: { home: number | null; away: number | null } };
};

function currentSeasonYear(): number {
  const now = new Date();
  const month = now.getUTCMonth(); // 0-indexed
  return month >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

function afHeaders(): Record<string, string> {
  if (FOOTBALL_API_BASE_URL.includes("rapidapi.com")) {
    return {
      "x-rapidapi-key": FOOTBALL_API_KEY ?? "",
      "x-rapidapi-host": new URL(FOOTBALL_API_BASE_URL).host,
    };
  }
  return { "x-apisports-key": FOOTBALL_API_KEY ?? "" };
}

async function afFetch<T>(path: string, revalidateSeconds: number): Promise<T | null> {
  if (!FOOTBALL_API_KEY) return null;
  const url = `${FOOTBALL_API_BASE_URL}${path}`;
  try {
    const res = await fetch(url, { headers: afHeaders(), next: { revalidate: revalidateSeconds } });
    if (!res.ok) {
      console.error(`[api-football] ${path} failed — ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[api-football] fetch error for ${path}:`, err);
    return null;
  }
}

function mapStatus(short: string): MatchStatus {
  switch (short) {
    case "NS":                                     return "scheduled";
    case "1H": case "2H": case "ET": case "P":
    case "LIVE": case "BT":                         return "live";
    case "HT":                                      return "paused";
    case "FT": case "AET": case "PEN":              return "finished";
    case "PST":                                     return "postponed";
    case "CANC": case "ABD": case "SUSP": case "AWD": case "WO": return "cancelled";
    default:                                        return "unknown";
  }
}

function toTeamRef(t: AFTeam): TeamRef {
  return { id: String(t.id), name: t.name, slug: slugifyName(t.name), crestUrl: t.logo };
}

function toCompetitionRef(l: AFFixture["league"]): CompetitionRef {
  const known = getCompetitionByProviderId("api-football", String(l.id));
  return { id: String(l.id), name: l.name, slug: known?.slug ?? slugifyName(l.name), country: l.country, emblemUrl: l.logo };
}

function toScore(f: AFFixture): Score {
  return {
    home: f.goals.home,
    away: f.goals.away,
    halfTimeHome: f.score.halftime.home,
    halfTimeAway: f.score.halftime.away,
  };
}

function toMatchSummary(f: AFFixture): MatchSummary {
  return {
    id: String(f.fixture.id),
    slug: buildMatchSlug(f.teams.home.name, f.teams.away.name, f.fixture.date),
    competition: toCompetitionRef(f.league),
    kickoff: f.fixture.date,
    status: mapStatus(f.fixture.status.short),
    minute: f.fixture.status.elapsed ?? undefined,
    homeTeam: toTeamRef(f.teams.home),
    awayTeam: toTeamRef(f.teams.away),
    score: toScore(f),
    venue: f.fixture.venue ? { name: f.fixture.venue.name, city: f.fixture.venue.city } : undefined,
  };
}

function toMatchFull(f: AFFixture): Match {
  return {
    ...toMatchSummary(f),
    referee: f.fixture.referee ?? undefined,
    watchLiveUrl: WATCH_LIVE_DEFAULT_URL || `/football/competition/${toCompetitionRef(f.league).slug}`,
  };
}

async function getMatchesInRange(from: string, to: string): Promise<MatchSummary[]> {
  // API-Football's /fixtures takes a single `date`, not a range — walk each
  // day in [from, to] and merge. Capped at 14 days so a mis-scoped call
  // (e.g. an entire season) can't fan out into hundreds of requests.
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const days: string[] = [];
  for (let d = new Date(start); d <= end && days.length < 14; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  const results = await Promise.all(
    days.map((date) => afFetch<{ response: AFFixture[] }>(`/fixtures?date=${date}`, REVALIDATE_FIXTURES))
  );
  return results.flatMap((r) => r?.response?.map(toMatchSummary) ?? []);
}

async function getLiveMatches(): Promise<MatchSummary[]> {
  const data = await afFetch<{ response: AFFixture[] }>(`/fixtures?live=all`, REVALIDATE_FIXTURES);
  return data?.response?.map(toMatchSummary) ?? [];
}

function computeFormFromRecent(team: TeamRef, recent: AFFixture[]): TeamForm {
  const results: FormResult[] = [];
  let goalsFor = 0;
  let goalsAgainst = 0;
  for (const f of recent) {
    const isHome = String(f.teams.home.id) === team.id;
    const gf = (isHome ? f.goals.home : f.goals.away) ?? 0;
    const ga = (isHome ? f.goals.away : f.goals.home) ?? 0;
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

  const data = await afFetch<{ response: AFFixture[] }>(`/fixtures?date=${dateStr}`, REVALIDATE_MATCH);
  const candidate = data?.response?.find(
    (f) => slugifyName(f.teams.home.name) === parts.homeSlug && slugifyName(f.teams.away.name) === parts.awaySlug
  );
  if (!candidate) return null;

  const match = toMatchFull(candidate);
  const season = candidate.league.season;

  const [h2h, standings, homeRecent, awayRecent] = await Promise.all([
    afFetch<{ response: AFFixture[] }>(`/fixtures/headtohead?h2h=${candidate.teams.home.id}-${candidate.teams.away.id}&last=10`, REVALIDATE_STANDINGS),
    afFetch<{ response: Array<{ league: { standings: Array<Array<{ rank: number; team: AFTeam; points: number; goalsDiff: number; all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } } }>> } }> }>(`/standings?league=${candidate.league.id}&season=${season}`, REVALIDATE_STANDINGS),
    afFetch<{ response: AFFixture[] }>(`/fixtures?team=${candidate.teams.home.id}&last=5`, REVALIDATE_FIXTURES),
    afFetch<{ response: AFFixture[] }>(`/fixtures?team=${candidate.teams.away.id}&last=5`, REVALIDATE_FIXTURES),
  ]);

  if (h2h?.response?.length) {
    const meetings = h2h.response.map((f) => ({
      date: f.fixture.date,
      homeTeam: toTeamRef(f.teams.home),
      awayTeam: toTeamRef(f.teams.away),
      score: toScore(f),
      competitionName: f.league.name,
    }));
    const homeWins = meetings.filter((m) => (m.score.home ?? 0) > (m.score.away ?? 0) && m.homeTeam.id === match.homeTeam.id).length
      + meetings.filter((m) => (m.score.away ?? 0) > (m.score.home ?? 0) && m.awayTeam.id === match.homeTeam.id).length;
    const awayWins = meetings.filter((m) => (m.score.home ?? 0) > (m.score.away ?? 0) && m.homeTeam.id === match.awayTeam.id).length
      + meetings.filter((m) => (m.score.away ?? 0) > (m.score.home ?? 0) && m.awayTeam.id === match.awayTeam.id).length;
    match.headToHead = { meetings, homeWins, awayWins, draws: meetings.length - homeWins - awayWins };
  }

  const table = standings?.response?.[0]?.league?.standings?.[0];
  if (table?.length) {
    match.standings = table.map((row): StandingRow => ({
      position: row.rank,
      team: toTeamRef(row.team),
      played: row.all.played,
      won: row.all.win,
      draw: row.all.draw,
      lost: row.all.lose,
      goalsFor: row.all.goals.for,
      goalsAgainst: row.all.goals.against,
      goalDifference: row.goalsDiff,
      points: row.points,
    }));
  }

  if (homeRecent?.response?.length) match.homeForm = computeFormFromRecent(match.homeTeam, homeRecent.response);
  if (awayRecent?.response?.length) match.awayForm = computeFormFromRecent(match.awayTeam, awayRecent.response);

  return match;
}

async function getStandings(competitionSlug: string) {
  const comp = getCompetitionBySlug(competitionSlug);
  if (!comp) return null;
  const season = currentSeasonYear();
  const data = await afFetch<{ response: Array<{ league: { id: number; name: string; country?: string; logo?: string; standings: Array<Array<{ rank: number; team: AFTeam; points: number; goalsDiff: number; all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } } }>> } }> }>(
    `/standings?league=${comp.ids["api-football"]}&season=${season}`,
    REVALIDATE_STANDINGS
  );
  const entry = data?.response?.[0];
  const table = entry?.league?.standings?.[0];
  if (!entry || !table) return null;
  return {
    competition: { id: String(entry.league.id), name: entry.league.name, slug: comp.slug, country: entry.league.country, emblemUrl: entry.league.logo },
    rows: table.map((row): StandingRow => ({
      position: row.rank,
      team: toTeamRef(row.team),
      played: row.all.played,
      won: row.all.win,
      draw: row.all.draw,
      lost: row.all.lose,
      goalsFor: row.all.goals.for,
      goalsAgainst: row.all.goals.against,
      goalDifference: row.goalsDiff,
      points: row.points,
    })),
  };
}

async function getTeamMatches(teamSlug: string) {
  const today = new Date();
  const past = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  const future = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
  const [recentData, upcomingData] = await Promise.all([
    getMatchesInRange(past.toISOString().slice(0, 10), today.toISOString().slice(0, 10)),
    getMatchesInRange(today.toISOString().slice(0, 10), future.toISOString().slice(0, 10)),
  ]);
  const belongs = (m: MatchSummary) => m.homeTeam.slug === teamSlug || m.awayTeam.slug === teamSlug;
  const recent = recentData.filter(belongs);
  const upcoming = upcomingData.filter(belongs);
  const teamMatch = recent[0] ?? upcoming[0];
  if (!teamMatch) return null;
  const team = teamMatch.homeTeam.slug === teamSlug ? teamMatch.homeTeam : teamMatch.awayTeam;
  return { team, recent, upcoming };
}

async function getCompetitionMatches(competitionSlug: string) {
  const comp = getCompetitionBySlug(competitionSlug);
  if (!comp) return null;
  const season = currentSeasonYear();
  const data = await afFetch<{ response: AFFixture[] }>(`/fixtures?league=${comp.ids["api-football"]}&season=${season}&next=20`, REVALIDATE_FIXTURES);
  if (!data) return null;
  return {
    competition: data.response[0] ? toCompetitionRef(data.response[0].league) : { id: comp.ids["api-football"], name: comp.name, slug: comp.slug, country: comp.country },
    matches: data.response.map(toMatchSummary),
  };
}

export const apiFootballProvider: FootballProvider = {
  id: "api-football",
  getMatchesInRange,
  getLiveMatches,
  getMatchBySlugParts,
  getStandings,
  getTeamMatches,
  getCompetitionMatches,
};
