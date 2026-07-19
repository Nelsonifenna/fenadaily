import type { Match } from "./types";
import type { FAQItem } from "./generate";
import { SITE_URL } from "./config";

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

const EVENT_STATUS: Record<Match["status"], string> = {
  scheduled: "https://schema.org/EventScheduled",
  live: "https://schema.org/EventScheduled",
  paused: "https://schema.org/EventScheduled",
  finished: "https://schema.org/EventScheduled",
  postponed: "https://schema.org/EventPostponed",
  cancelled: "https://schema.org/EventCancelled",
  unknown: "https://schema.org/EventScheduled",
};

export function buildSportsEventSchema(match: Match, matchUrl: string) {
  const name = `${match.homeTeam.name} vs ${match.awayTeam.name}`;

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "@id": `${matchUrl}#event`,
    name,
    startDate: match.kickoff,
    eventStatus: EVENT_STATUS[match.status],
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: matchUrl,
    description: `${name} — ${match.competition.name}${match.venue?.name ? ` at ${match.venue.name}` : ""}.`,
    sport: "Football",
    ...(match.venue?.name
      ? {
          location: {
            "@type": "Place",
            name: match.venue.name,
            ...(match.venue.city ? { address: { "@type": "PostalAddress", addressLocality: match.venue.city } } : {}),
          },
        }
      : {}),
    homeTeam: { "@type": "SportsTeam", name: match.homeTeam.name },
    awayTeam: { "@type": "SportsTeam", name: match.awayTeam.name },
    competitor: [
      { "@type": "SportsTeam", name: match.homeTeam.name },
      { "@type": "SportsTeam", name: match.awayTeam.name },
    ],
    organizer: { "@type": "SportsOrganization", name: match.competition.name },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}
