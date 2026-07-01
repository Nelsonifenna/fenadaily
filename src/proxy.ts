import { NextResponse, type NextRequest } from "next/server";

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
  matcher: ["/((?!_next/|api/|favicon.ico|sitemap.xml|robots.txt).*)"],
};
