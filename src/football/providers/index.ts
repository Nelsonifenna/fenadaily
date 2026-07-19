import type { FootballProvider } from "../types";
import { FOOTBALL_PROVIDER_ID } from "../config";
import { footballDataProvider } from "./football-data";
import { apiFootballProvider } from "./api-football";
import { sportmonksProvider } from "./sportmonks";

const PROVIDERS: Record<string, FootballProvider> = {
  "football-data": footballDataProvider,
  "api-football": apiFootballProvider,
  "sportmonks": sportmonksProvider,
};

export function getFootballProvider(): FootballProvider {
  return PROVIDERS[FOOTBALL_PROVIDER_ID];
}
