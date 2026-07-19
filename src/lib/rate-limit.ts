import { headers } from "next/headers";

// Best-effort in-memory rate limiter for Server Actions.
//
// Serverless functions are ephemeral and not shared across regions or cold
// starts, so this is not a hard distributed guarantee — but it meaningfully
// raises the cost of scripted abuse (form spam, newsletter email-bombing of
// third parties, Resend quota exhaustion) against a single warm instance at
// zero added infrastructure. Swap for Vercel KV/Upstash if stricter,
// cross-instance limits are ever needed.
const buckets = new Map<string, { count: number; resetAt: number }>();

// Safety cap so a burst of distinct IPs can't grow this map without bound.
const MAX_TRACKED_KEYS = 5000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

export async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  const forwardedFor = hdrs.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return hdrs.get("x-real-ip") ?? "unknown";
}
