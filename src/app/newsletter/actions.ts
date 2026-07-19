"use server";

import { Resend } from "resend";
import { generateUnsubscribeToken } from "@/lib/unsubscribe";
import { buildWelcomeEmail } from "@/lib/welcome-email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export type NewsletterState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const OWNER_EMAIL = "fenadaily@gmail.com";
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_EMAIL  = process.env.RESEND_FROM_EMAIL ?? "Fena Daily <onboarding@resend.dev>";
const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fenadaily.com";

type ResendContact = { id: string; email: string; unsubscribed: boolean };

async function isAlreadySubscribed(
  resend: Resend,
  audienceId: string,
  email: string
): Promise<boolean> {
  try {
    const result = await resend.contacts.list({ audienceId });
    const rows: ResendContact[] =
      (result as { data?: { data?: ResendContact[] } }).data?.data ?? [];
    return rows.some((c) => c.email?.toLowerCase() === email.toLowerCase());
  } catch {
    // If the check fails (network, etc.) we let the flow continue rather
    // than blocking a genuine new subscriber.
    return false;
  }
}

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = formData.get("email")?.toString().trim() ?? "";

  if (!email) {
    return { status: "error", message: "Please enter your email address." };
  }
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const ip = await getClientIp();
  if (!rateLimit(`newsletter:${ip}`, 5, 10 * 60 * 1000)) {
    return { status: "error", message: "Too many attempts. Please try again in a few minutes." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[newsletter] RESEND_API_KEY not set. Subscriber: ${email}`);
    return { status: "success" };
  }

  try {
    const resend    = new Resend(apiKey);
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (audienceId) {
      // ── Duplicate gate ──────────────────────────────────────────────────────
      // Query the audience before sending any emails. If the address is already
      // there (active or unsubscribed), return success immediately so the UI
      // shows the confirmation but no notification or welcome email is sent.
      const duplicate = await isAlreadySubscribed(resend, audienceId, email);
      if (duplicate) {
        return { status: "success" };
      }

      // New subscriber — persist to audience
      try {
        await resend.contacts.create({ email, audienceId, unsubscribed: false });
      } catch {
        // Non-fatal — continue and send emails even if contact creation fails
      }
    }

    // Build signed unsubscribe URL
    const token          = generateUnsubscribeToken(email);
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;

    // Welcome email to subscriber
    const { html, text } = buildWelcomeEmail({ siteUrl: SITE_URL, unsubscribeUrl });
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      email,
      subject: "Welcome to Fena Daily ✦",
      headers: {
        "List-Unsubscribe":      `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      html,
      text,
    });

    // Owner notification — only reaches here for genuinely new subscribers
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      OWNER_EMAIL,
      subject: "New Newsletter Subscriber",
      text:    `New subscriber: ${email}`,
    });

    return { status: "success" };
  } catch (err) {
    console.error("[newsletter] Resend error:", err);
    return {
      status:  "error",
      message: "Something went wrong. Please try again.",
    };
  }
}
