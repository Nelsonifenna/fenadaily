import { NextResponse, type NextRequest } from "next/server";

// The apex domain is what canonical tags, sitemap.xml, and robots.txt all
// declare as the site's true URL (see NEXT_PUBLIC_SITE_URL). If Vercel's
// domain settings ever point www at this app without redirecting it to the
// apex first, every page would render with a canonical URL that points back
// to a different host than the one serving it — a canonical/redirect
// conflict that stops Google from indexing anything. This is a safety net,
// not the primary fix: the primary fix is Vercel Project Settings > Domains,
// where www.<domain> should redirect to the apex domain.
const CANONICAL_HOST = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fenadaily.com").hostname;
const WWW_HOST = `www.${CANONICAL_HOST}`;

// Legacy WordPress-style URL that should permanently collapse onto the
// homepage. Handled here (with skipTrailingSlashRedirect in next.config)
// so /home/ resolves to / in a single 308 hop instead of the two-hop
// /home/ -> /home -> / chain Next's default trailing-slash redirect would
// produce (it fires before custom redirects/middleware can see the request).
const LEGACY_REDIRECTS: Record<string, string> = {
  "/home": "/",
  "/home/": "/",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.nextUrl.hostname === WWW_HOST) {
    const url = request.nextUrl.clone();
    url.hostname = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  const legacyDestination = LEGACY_REDIRECTS[pathname];
  if (legacyDestination) {
    return NextResponse.redirect(new URL(legacyDestination + request.nextUrl.search, request.url), 308);
  }

  // Replicate Next's default trailing-slash normalization (trailingSlash:
  // false) ourselves, since skipTrailingSlashRedirect turns it off globally.
  // Without this, every route would become reachable both with and without
  // a trailing slash — a duplicate-content regression we're explicitly here
  // to avoid.
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const target = pathname.slice(0, -1) + request.nextUrl.search;
    return NextResponse.redirect(new URL(target, request.url), 308);
  }

  return NextResponse.next();
}

export const config = {
  // sitemap.xml/robots.txt/favicon.ico are included (unlike before) so the
  // www -> apex host redirect above also covers them — Google fetches both
  // by exact URL, and both must resolve on the canonical host without a
  // redirect of their own once request already targets the apex domain.
  matcher: ["/((?!_next/|api/).*)"],
};
