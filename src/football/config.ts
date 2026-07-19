// All football-module configuration lives here, driven entirely by
// environment variables. Nothing in this file (or anywhere in src/football)
// is imported by the existing blog/CMS code — this module is additive only.

export type FootballProviderId = "football-data" | "api-football" | "sportmonks";

function readProviderId(): FootballProviderId {
  const raw = (process.env.FOOTBALL_API_PROVIDER ?? "football-data").trim().toLowerCase();
  if (raw === "api-football" || raw === "sportmonks" || raw === "football-data") return raw;
  console.warn(`[football] Unknown FOOTBALL_API_PROVIDER "${raw}" — falling back to "football-data".`);
  return "football-data";
}

export const FOOTBALL_PROVIDER_ID: FootballProviderId = readProviderId();
export const FOOTBALL_API_KEY: string | undefined = process.env.FOOTBALL_API_KEY;

// Per-provider default API hosts — overridable for self-hosted proxies or
// region-specific hosts (e.g. API-Football via RapidAPI vs. api-sports.io).
export const FOOTBALL_API_BASE_URL: string =
  process.env.FOOTBALL_API_BASE_URL?.trim() || defaultBaseUrl(FOOTBALL_PROVIDER_ID);

function defaultBaseUrl(provider: FootballProviderId): string {
  switch (provider) {
    case "football-data": return "https://api.football-data.org/v4";
    case "api-football":  return "https://v3.football.api-sports.io";
    case "sportmonks":    return "https://api.sportmonks.com/v3/football";
  }
}

// Where the "Watch Live" button sends visitors. Can be a fixed destination
// (an affiliate/partner streaming page, your own live-blog page, etc.) or
// left unset, in which case the button links to the match's competition
// page on this site — never a broken/empty link.
export const WATCH_LIVE_DEFAULT_URL: string = process.env.FOOTBALL_WATCH_LIVE_URL?.trim() || "";

// Revalidation windows (seconds). Live-match data goes stale fast; fixtures,
// standings and team pages change far less often.
export const REVALIDATE_LIVE        = Number(process.env.FOOTBALL_REVALIDATE_LIVE_SECONDS)        || 60;
export const REVALIDATE_FIXTURES    = Number(process.env.FOOTBALL_REVALIDATE_FIXTURES_SECONDS)    || 900;   // 15 min
export const REVALIDATE_MATCH       = Number(process.env.FOOTBALL_REVALIDATE_MATCH_SECONDS)       || 300;   // 5 min
export const REVALIDATE_STANDINGS   = Number(process.env.FOOTBALL_REVALIDATE_STANDINGS_SECONDS)   || 3600;  // 1 hour

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";

export function isFootballConfigured(): boolean {
  return Boolean(FOOTBALL_API_KEY);
}
