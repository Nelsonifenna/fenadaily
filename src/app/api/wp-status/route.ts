import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const wordpressUrl = process.env.WORDPRESS_URL ?? "(not set)";
  const apiBase     = `${wordpressUrl}/wp-json/wp/v2`;
  const testUrl     = `${apiBase}/posts?per_page=1`;

  const result: Record<string, unknown> = {
    wordpress_url_env: wordpressUrl,
    test_url:          testUrl,
    timestamp:         new Date().toISOString(),
  };

  try {
    const res = await fetch(testUrl, {
      headers: {
        "User-Agent": "FenaDaily-StatusCheck/1.0",
        "Accept":     "application/json",
      },
      cache: "no-store",
    });

    result.http_status  = res.status;
    result.ok           = res.ok;
    result.content_type = res.headers.get("content-type");
    result.server       = res.headers.get("server");
    result.x_powered_by = res.headers.get("x-powered-by");
    result.vercel_id    = res.headers.get("x-vercel-id");
    result.mitigated    = res.headers.get("x-vercel-mitigated");

    const body = await res.text();
    result.body_preview = body.slice(0, 300);

    if (res.ok) {
      try {
        const json = JSON.parse(body);
        result.is_valid_json     = true;
        result.post_count        = Array.isArray(json) ? json.length : "not an array";
        result.first_post_slug   = Array.isArray(json) && json[0] ? json[0].slug : null;
        result.first_post_title  = Array.isArray(json) && json[0] ? json[0].title?.rendered : null;
      } catch {
        result.is_valid_json = false;
      }
    }
  } catch (err) {
    result.fetch_error = err instanceof Error ? err.message : String(err);
  }

  const isWorking = result.ok === true && result.is_valid_json === true;

  return NextResponse.json(
    {
      status:  isWorking ? "ok" : "error",
      message: isWorking
        ? "WordPress API is reachable and returning posts."
        : "WordPress API is NOT reachable. See details below.",
      details: result,
    },
    { status: isWorking ? 200 : 503 }
  );
}
