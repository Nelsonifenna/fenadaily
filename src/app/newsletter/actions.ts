"use server";

import { Resend } from "resend";

export type NewsletterState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const OWNER_EMAIL = "fenadaily@gmail.com";
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Set RESEND_FROM_EMAIL in Vercel once your domain is verified in Resend.
// Until then the default Resend address is used automatically.
const FROM_EMAIL  = process.env.RESEND_FROM_EMAIL ?? "Fena Daily <onboarding@resend.dev>";

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Key not yet configured — log server-side, still acknowledge the user
    console.warn(`[newsletter] RESEND_API_KEY not set. Subscriber: ${email}`);
    return { status: "success" };
  }

  try {
    const resend = new Resend(apiKey);

    // Persist to Resend Audience when configured (set RESEND_AUDIENCE_ID in .env.local)
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      try {
        await resend.contacts.create({ email, audienceId, unsubscribed: false });
      } catch {
        // Contact may already exist; non-fatal — proceed with welcome email
      }
    }

    // Welcome email to subscriber
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      email,
      subject: "You're subscribed to Fena Daily",
      text: [
        "Welcome to Fena Daily!",
        "",
        "Thank you for subscribing. You'll receive our top stories across",
        "AI, Football, Crypto, Business, Technology, Music, and Politics —",
        "delivered directly to your inbox.",
        "",
        "— The Fena Daily team",
      ].join("\n"),
    });

    // Owner notification
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
