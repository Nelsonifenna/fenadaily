import { createHmac } from "crypto";

function secret(): string {
  return process.env.UNSUBSCRIBE_SECRET ?? "dev-secret-replace-in-production";
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
