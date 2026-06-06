import { createHmac } from "crypto";

// A predictable fallback secret would let anyone forge unsubscribe tokens for
// arbitrary email addresses. Warn loudly so a missing env var in production
// is caught quickly, but don't crash page rendering over it.
let warned = false;

function secret(): string {
  const configured = process.env.UNSUBSCRIBE_SECRET;
  if (configured) return configured;

  if (!warned) {
    console.error(
      "[unsubscribe] UNSUBSCRIBE_SECRET is not set — falling back to an insecure " +
      "default. Set UNSUBSCRIBE_SECRET in the environment (openssl rand -hex 32) " +
      "to prevent unsubscribe tokens from being forged."
    );
    warned = true;
  }
  return "dev-secret-replace-in-production";
}

export function generateUnsubscribeToken(email: string): string {
  return createHmac("sha256", secret())
    .update(email.toLowerCase())
    .digest("hex")
    .slice(0, 40);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = generateUnsubscribeToken(email);
  if (expected.length !== token.length) return false;
  // Constant-time comparison — prevents timing attacks
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}
