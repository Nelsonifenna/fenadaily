"use server";

import { Resend } from "resend";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

export type UnsubscribeState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function processUnsubscribe(
  _prev: UnsubscribeState,
  formData: FormData
): Promise<UnsubscribeState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const token = formData.get("token")?.toString().trim() ?? "";

  if (!email || !token) {
    return { status: "error", message: "Invalid unsubscribe link." };
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return { status: "error", message: "This unsubscribe link is invalid or has expired." };
  }

  const apiKey     = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (apiKey && audienceId) {
    try {
      const resend = new Resend(apiKey);

      // List contacts and find by email, then mark unsubscribed.
      // Suitable for audiences up to a few thousand contacts.
      const result = await resend.contacts.list({ audienceId });
      const rows   = (result as { data?: { data?: { id: string; email: string }[] } }).data?.data ?? [];
      const match  = rows.find((c) => c.email?.toLowerCase() === email.toLowerCase());

      if (match?.id) {
        await resend.contacts.update({ audienceId, id: match.id, unsubscribed: true });
      }
    } catch (err) {
      console.error("[unsubscribe] Resend error:", err);
      // Still confirm success to the user — manual cleanup can follow
    }
  }

  return { status: "success" };
}
