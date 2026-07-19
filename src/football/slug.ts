// URL slug generation/parsing for match pages, e.g.
// /football/watch/arsenal-vs-chelsea-january-14-2027
//
// The "-vs-" separator and the trailing "{month}-{day}-{year}" suffix are
// both fixed, recognizable tokens, which is what makes parsing back out of
// a single slug (rather than using multiple dynamic segments) reliable even
// though team names themselves are hyphenated.

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
] as const;

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDateSlug(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const month = MONTH_NAMES[d.getUTCMonth()];
  return `${month}-${d.getUTCDate()}-${d.getUTCFullYear()}`;
}

export function buildMatchSlug(homeName: string, awayName: string, kickoffIso: string): string {
  return `${slugifyName(homeName)}-vs-${slugifyName(awayName)}-${formatDateSlug(kickoffIso)}`;
}

const DATE_SUFFIX_RE = new RegExp(`-(${MONTH_NAMES.join("|")})-(\\d{1,2})-(\\d{4})$`);

export function parseMatchSlug(
  slug: string
): { homeSlug: string; awaySlug: string; dateSlug: string } | null {
  const vsIndex = slug.indexOf("-vs-");
  if (vsIndex === -1) return null;

  const homeSlug = slug.slice(0, vsIndex);
  const rest = slug.slice(vsIndex + 4); // past "-vs-"

  const dateMatch = rest.match(DATE_SUFFIX_RE);
  if (!dateMatch) return null;

  const awaySlug = rest.slice(0, dateMatch.index);
  const dateSlug = dateMatch[0].slice(1); // drop leading hyphen

  if (!homeSlug || !awaySlug) return null;
  return { homeSlug, awaySlug, dateSlug };
}

export function isSameCalendarDate(isoDateTime: string, dateSlug: string): boolean {
  return formatDateSlug(isoDateTime) === dateSlug;
}

/** YYYY-MM-DD for a Date, in UTC — used for provider date-range queries. */
export function toApiDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
