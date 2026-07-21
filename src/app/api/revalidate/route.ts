import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "node:crypto";

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
  let categorySlug: string | undefined;
  try {
    const body = await request.json();
    if (typeof body?.slug === "string") slug = body.slug;
    if (typeof body?.category === "string") categorySlug = body.category;
  } catch {
    // No JSON body (or empty) is fine — we still revalidate the shared
    // routes below, which is enough to fix the sitemap/homepage on its own.
  }

  const revalidated: string[] = ["/sitemap.xml", "/"];
  revalidatePath("/sitemap.xml");
  revalidatePath("/");

  if (slug) {
    revalidatePath(`/article/${slug}`);
    revalidated.push(`/article/${slug}`);
  }
  if (categorySlug) {
    revalidatePath(`/category/${categorySlug}`);
    revalidated.push(`/category/${categorySlug}`);
  }

  return NextResponse.json({ revalidated: true, paths: revalidated, timestamp: new Date().toISOString() });
}
