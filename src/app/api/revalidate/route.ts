import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { CATEGORIES } from "@/lib/categories";
import { AUTHORS } from "@/lib/authors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Constant-time string comparison — see src/app/api/wp-status/route.ts for
// why a naive `!==` here would let an attacker guess REVALIDATE_SECRET one
// character at a time by measuring response latency.
function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

// On-demand ISR revalidation, called by a WordPress publish/update webhook
// (see docs/wordpress-revalidate-webhook.md) so newly published or edited
// articles appear on the site — and in the sitemap — immediately, instead
// of waiting for sitemap.ts's time-based `revalidate` window to elapse.
//
// Without a configured secret the endpoint is disabled entirely (404), same
// posture as /api/wp-status.
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided =
    request.nextUrl.searchParams.get("secret") ?? request.headers.get("x-revalidate-secret") ?? "";

  if (!secret || !provided || !timingSafeStringEqual(provided, secret)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let slug: string | undefined;
  try {
    const body = await request.json();
    if (typeof body?.slug === "string") slug = body.slug;
  } catch {
    // No JSON body (or empty) is fine — we still revalidate every shared
    // discovery path below, which is enough to fix the sitemap/homepage on
    // its own even if WordPress sends no payload at all.
  }

  const revalidated: string[] = ["/sitemap.xml", "/"];
  revalidatePath("/sitemap.xml");
  revalidatePath("/");

  if (slug) {
    revalidatePath(`/article/${slug}`);
    revalidated.push(`/article/${slug}`);
  }

  // Every category and author page is revalidated unconditionally rather
  // than relying on WordPress's payload naming the *correct* category slug
  // (fragile — WP's own slug naming doesn't always match ours, multi-category
  // posts only have one "primary" category, and a mismatch there would
  // silently leave that one category page stale). The full set is small and
  // fixed (see src/lib/categories.ts, src/lib/authors.ts), so revalidating
  // all of it on every publish is cheap and removes that failure mode
  // entirely — a new article is guaranteed to show up on its category page
  // and its author's page the moment this endpoint is called, regardless of
  // what WordPress does or doesn't tell us about it.
  for (const { slug: categorySlug } of CATEGORIES) {
    revalidatePath(`/category/${categorySlug}`);
    revalidated.push(`/category/${categorySlug}`);
  }
  for (const { slug: authorSlug } of AUTHORS) {
    revalidatePath(`/author/${authorSlug}`);
    revalidated.push(`/author/${authorSlug}`);
  }

  return NextResponse.json({ revalidated: true, paths: revalidated, timestamp: new Date().toISOString() });
}
