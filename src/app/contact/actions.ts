"use server";

import { Resend } from "resend";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const RECIPIENT   = "fenadaily@gmail.com";
const FROM_EMAIL  = process.env.RESEND_FROM_EMAIL ?? "Fena Daily <onboarding@resend.dev>";

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name    = formData.get("name")?.toString().trim()    ?? "";
  const email   = formData.get("email")?.toString().trim()   ?? "";
  const message = formData.get("message")?.toString().trim() ?? "";

  // Honeypot: a field real visitors never see or fill, but bots that
  // auto-fill every input on the form do. Pretend success so bots don't
  // learn to avoid it, without sending the message anywhere.
  const honeypot = formData.get("website")?.toString().trim() ?? "";
  if (honeypot) {
    return { status: "success" };
  }

  // Server-side validation (defence against JS-disabled clients bypassing required)
  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in all fields." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  if (message.length < 10) {
    return { status: "error", message: "Message is too short." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // API key not yet configured — fail gracefully
    console.error("RESEND_API_KEY is not set");
    return {
      status: "error",
      message: `Email us directly at ${RECIPIENT}. Our contact form is being set up.`,
    };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM_EMAIL,
      to:   RECIPIENT,
      replyTo: email,
      subject: `Message from ${name} via Fena Daily`,
      text: [
        `Name:    ${name}`,
        `Email:   ${email}`,
        ``,
        `Message:`,
        message,
      ].join("\n"),
    });

    return { status: "success" };
  } catch (err) {
    console.error("Contact form submission error:", err);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again or email us directly.",
    };
  }
}
