"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "./actions";

const FALLBACK_EMAIL = "fenadaily@gmail.com";

const initial: ContactState = { status: "idle" };

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white " +
  "placeholder:text-zinc-500 focus:border-amber-400/60 focus:outline-none " +
  "focus:ring-1 focus:ring-amber-400/40 disabled:opacity-50";

export function ContactForm({ email }: { email: string | null }) {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.status === "success") {
    return (
      <div
        role="alert"
        className="mt-8 rounded-xl border border-green-400/20 bg-green-400/10 p-6"
      >
        <p className="font-semibold text-green-300">Message sent ✓</p>
        <p className="mt-1 text-sm text-green-400/80">
          Thanks for reaching out. We&apos;ll get back to you within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      {/* Error banner */}
      {state.status === "error" && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.message}
        </p>
      )}

      {/* Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300" htmlFor="name">
          Name <span className="text-amber-400" aria-hidden>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="Your name"
          disabled={pending}
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300" htmlFor="email">
          Email <span className="text-amber-400" aria-hidden>*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@example.com"
          disabled={pending}
          className={inputClass}
        />
      </div>

      {/* Message */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300" htmlFor="message">
          Message <span className="text-amber-400" aria-hidden>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          autoComplete="off"
          required
          minLength={10}
          maxLength={5000}
          placeholder="Your message..."
          disabled={pending}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Submit */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          aria-disabled={pending}
          className="w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300 disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
        <p className="text-xs text-zinc-500">
          Or email us at{" "}
          <a
            href={`mailto:${email ?? FALLBACK_EMAIL}`}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            {email ?? FALLBACK_EMAIL}
          </a>
        </p>
      </div>
    </form>
  );
}
