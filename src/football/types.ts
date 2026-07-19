// Common domain model for the football module. Every provider adapter
// (football-data.org, API-Football, Sportmonks) maps its own response shape
// into these types, so pages/components never need to know which provider
// is configured. Fields that aren't reliably available across providers or
// subscription tiers (lineups, player stats, referee, TV info) are optional
// — pages must render sensibly with or without them, never fabricate them.

export type MatchStatus =
  | "scheduled"
  | "live"
  | "paused"
  | "finished"
  | "postponed"
  | "cancelled"
  | "unknown";

export type TeamRef = {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  crestUrl?: string;
};

export type CompetitionRef = {
  id: string;
  name: string;
  slug: string;
  country?: string;
  emblemUrl?: string;
};

export type Venue = {
  name?: string;
  city?: string;
};

export type Score = {
  home: number | null;
  away: number | null;
  halfTimeHome?: number | null;
  halfTimeAway?: number | null;
};

export type FormResult = "W" | "D" | "L";

export type TeamForm = {
  team: TeamRef;
  results: FormResult[]; // most recent last
  goalsFor: number;
  goalsAgainst: number;
};

export type HeadToHeadMeeting = {
  date: string; // ISO date
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  score: Score;
  competitionName?: string;
};

export type HeadToHead = {
  meetings: HeadToHeadMeeting[]; // most recent first
  homeWins: number;
  awayWins: number;
  draws: number;
};

export type StandingRow = {
  position: number;
  team: TeamRef;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type LineupPlayer = {
  name: string;
  position?: string;
  shirtNumber?: number;
};

export type TeamLineup = {
  team: TeamRef;
  formation?: string;
  startingXI: LineupPlayer[];
  substitutes: LineupPlayer[];
};

export type KeyPlayer = {
  team: TeamRef;
  name: string;
  note: string; // short, data-derived note (e.g. "Top scorer this season")
};

export type Match = {
  id: string;
  slug: string;
  competition: CompetitionRef;
  season?: string;
  matchday?: number;
  kickoff: string; // ISO 8601, UTC
  status: MatchStatus;
  minute?: number; // live matches only
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  score: Score;
  venue?: Venue;
  referee?: string;
  // Deliberately NOT included: hardcoded broadcaster/TV-channel names.
  // None of the supported providers reliably supply verified regional
  // broadcast info, and guessing would risk publishing incorrect
  // "watch on X channel" claims. `watchLiveUrl` is the single source of
  // truth for "where to watch" — see src/football/config.ts.
  watchLiveUrl: string;
  homeForm?: TeamForm;
  awayForm?: TeamForm;
  headToHead?: HeadToHead;
  standings?: StandingRow[];
  lineups?: { home?: TeamLineup; away?: TeamLineup };
  keyPlayers?: KeyPlayer[];
};

export type MatchSummary = Pick<
  Match,
  "id" | "slug" | "competition" | "kickoff" | "status" | "minute" | "homeTeam" | "awayTeam" | "score" | "venue"
>;

export type FootballProvider = {
  id: "football-data" | "api-football" | "sportmonks";
  /** Matches within [from, to] inclusive, ISO date strings (YYYY-MM-DD). */
  getMatchesInRange(from: string, to: string): Promise<MatchSummary[]>;
  getLiveMatches(): Promise<MatchSummary[]>;
  getMatchBySlugParts(parts: SlugParts): Promise<Match | null>;
  getStandings(competitionSlug: string): Promise<{ competition: CompetitionRef; rows: StandingRow[] } | null>;
  getTeamMatches(teamSlug: string): Promise<{ team: TeamRef; upcoming: MatchSummary[]; recent: MatchSummary[] } | null>;
  getCompetitionMatches(competitionSlug: string): Promise<{ competition: CompetitionRef; matches: MatchSummary[] } | null>;
};

export type SlugParts = {
  homeSlug: string;
  awaySlug: string;
  dateSlug: string; // e.g. "january-14-2027"
};
