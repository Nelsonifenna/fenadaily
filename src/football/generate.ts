// Turns structured match data into original, human-readable page content:
// preview paragraphs, form/head-to-head summaries, and FAQs. Everything here
// is composed from the match's own data (form, standings, H2H record) —
// nothing is copied from, or looks up, any external site. Phrasing branches
// on the actual numbers, so two different matches produce different text
// rather than the same template with names swapped in.
//
// This is intentionally template-based rather than an LLM call: it needs no
// extra API key or per-page cost, never hallucinates a stat that isn't in
// the data, and degrades gracefully when a data point (H2H, standings) isn't
// available on your provider tier. If you later want richer prose, this
// module is the natural place to swap in a real LLM call (e.g. the Claude
// API) using the same inputs as the prompt — the page components don't care
// how the strings were produced.

import type { Match, TeamForm, HeadToHead, TeamRef, StandingRow } from "./types";

function formPoints(form: TeamForm): number {
  return form.results.reduce((sum, r) => sum + (r === "W" ? 3 : r === "D" ? 1 : 0), 0);
}

function formString(form: TeamForm): string {
  return form.results.join("-");
}

export function generateFormSummary(form: TeamForm | undefined, teamName: string): string | null {
  if (!form || form.results.length === 0) return null;
  const wins = form.results.filter((r) => r === "W").length;
  const draws = form.results.filter((r) => r === "D").length;
  const losses = form.results.filter((r) => r === "L").length;
  const n = form.results.length;

  const recordPhrase =
    wins >= Math.ceil(n * 0.6)
      ? "in strong form"
      : losses >= Math.ceil(n * 0.6)
      ? "struggling for results"
      : "showing mixed form";

  return `${teamName} are ${recordPhrase} coming into this match, with ${wins} win${wins === 1 ? "" : "s"}, ${draws} draw${draws === 1 ? "" : "s"} and ${losses} loss${losses === 1 ? "" : "es"} in their last ${n} games (${formString(form)}), scoring ${form.goalsFor} and conceding ${form.goalsAgainst} in that span.`;
}

export function generateH2HSummary(h2h: HeadToHead | undefined, home: TeamRef, away: TeamRef): string | null {
  if (!h2h || h2h.meetings.length === 0) return null;
  const total = h2h.meetings.length;
  const leader =
    h2h.homeWins > h2h.awayWins ? home.name : h2h.awayWins > h2h.homeWins ? away.name : null;

  const leadPhrase = leader
    ? `${leader} have the edge in this fixture historically`
    : "the two sides are evenly matched historically";

  const last = h2h.meetings[0];
  const lastResult =
    last.score.home !== null && last.score.away !== null
      ? `Their last meeting finished ${last.homeTeam.name} ${last.score.home}-${last.score.away} ${last.awayTeam.name}${last.competitionName ? ` in the ${last.competitionName}` : ""}.`
      : "";

  return `Across their last ${total} meeting${total === 1 ? "" : "s"}, ${home.name} have won ${h2h.homeWins}, ${away.name} have won ${h2h.awayWins}, and ${h2h.draws} ended level — ${leadPhrase}. ${lastResult}`.trim();
}

function standingLine(row: StandingRow | undefined, teamName: string): string | null {
  if (!row) return null;
  return `${teamName} sit ${ordinal(row.position)} in the table with ${row.points} points from ${row.played} games (${row.won}W ${row.draw}D ${row.lost}L, goal difference ${row.goalDifference >= 0 ? "+" : ""}${row.goalDifference}).`;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export function generateMatchPreview(match: Match): string[] {
  const paragraphs: string[] = [];
  const kickoffDate = new Date(match.kickoff);
  const dateLabel = kickoffDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const venuePhrase = match.venue?.name ? ` at ${match.venue.name}` : "";

  paragraphs.push(
    `${match.homeTeam.name} host ${match.awayTeam.name} in the ${match.competition.name} on ${dateLabel}${venuePhrase}.` +
      (match.matchday ? ` It's matchday ${match.matchday} of the competition.` : "")
  );

  const homeStanding = match.standings?.find((r) => r.team.id === match.homeTeam.id);
  const awayStanding = match.standings?.find((r) => r.team.id === match.awayTeam.id);
  const standingsLines = [standingLine(homeStanding, match.homeTeam.name), standingLine(awayStanding, match.awayTeam.name)].filter(Boolean);
  if (standingsLines.length) paragraphs.push(standingsLines.join(" "));

  const homeFormLine = generateFormSummary(match.homeForm, match.homeTeam.name);
  const awayFormLine = generateFormSummary(match.awayForm, match.awayTeam.name);
  if (match.homeForm && match.awayForm) {
    const homePts = formPoints(match.homeForm);
    const awayPts = formPoints(match.awayForm);
    const momentum =
      homePts > awayPts
        ? `${match.homeTeam.name} arrive with the better recent momentum of the two sides.`
        : awayPts > homePts
        ? `${match.awayTeam.name} arrive with the better recent momentum of the two sides.`
        : "Both sides arrive with almost identical recent momentum.";
    paragraphs.push([homeFormLine, awayFormLine, momentum].filter(Boolean).join(" "));
  } else if (homeFormLine || awayFormLine) {
    paragraphs.push([homeFormLine, awayFormLine].filter(Boolean).join(" "));
  }

  const h2hLine = generateH2HSummary(match.headToHead, match.homeTeam, match.awayTeam);
  if (h2hLine) paragraphs.push(h2hLine);

  if (match.referee) {
    paragraphs.push(`The match will be officiated by ${match.referee}.`);
  }

  return paragraphs;
}

export type FAQItem = { question: string; answer: string };

export function generateFAQs(match: Match): FAQItem[] {
  const faqs: FAQItem[] = [];
  const kickoff = new Date(match.kickoff);
  const localTime = kickoff.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
  const utcTime = kickoff.toISOString().slice(11, 16);
  const dateLabel = kickoff.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  faqs.push({
    question: `What time does ${match.homeTeam.name} vs ${match.awayTeam.name} kick off?`,
    answer: `Kickoff is at ${localTime} (${utcTime} UTC) on ${dateLabel}.`,
  });

  faqs.push({
    question: `Where can I watch ${match.homeTeam.name} vs ${match.awayTeam.name}?`,
    answer: `Use the Watch Live button on this page for the latest streaming link. Broadcast and streaming rights vary by region, so availability depends on where you're located — check local listings or your usual sports streaming service for confirmed coverage in your country.`,
  });

  if (match.venue?.name) {
    faqs.push({
      question: `Where is ${match.homeTeam.name} vs ${match.awayTeam.name} being played?`,
      answer: `The match is being played at ${match.venue.name}${match.venue.city ? ` in ${match.venue.city}` : ""}.`,
    });
  }

  if (match.headToHead && match.headToHead.meetings.length > 0) {
    const last = match.headToHead.meetings[0];
    faqs.push({
      question: `Who won the last meeting between ${match.homeTeam.name} and ${match.awayTeam.name}?`,
      answer:
        last.score.home !== null && last.score.away !== null
          ? `${last.homeTeam.name} ${last.score.home}-${last.score.away} ${last.awayTeam.name}${last.competitionName ? ` (${last.competitionName})` : ""}.`
          : `Head-to-head records show ${match.headToHead.meetings.length} previous meetings between the two sides.`,
    });
  }

  const homeStanding = match.standings?.find((r) => r.team.id === match.homeTeam.id);
  const awayStanding = match.standings?.find((r) => r.team.id === match.awayTeam.id);
  if (homeStanding && awayStanding) {
    faqs.push({
      question: `Where do ${match.homeTeam.name} and ${match.awayTeam.name} stand in the ${match.competition.name} table?`,
      answer: `${match.homeTeam.name} are ${ordinal(homeStanding.position)} with ${homeStanding.points} points; ${match.awayTeam.name} are ${ordinal(awayStanding.position)} with ${awayStanding.points} points.`,
    });
  }

  return faqs;
}
