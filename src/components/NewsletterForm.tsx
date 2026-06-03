"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "@/app/newsletter/actions";

const initial: NewsletterState = { status: "idle" };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);

  if (state.status === "success") {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="mt-5 rounded-xl border border-green-400/20 bg-green-400/10 px-5 py-4 sm:mt-6"
      >
        <p className="flex items-center gap-2 font-semibold text-green-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Subscribed!
        </p>
        <p className="mt-1 text-sm text-green-400/80">
          Thank you for subscribing to Fena Daily.
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="mt-5 sm:mt-6">
      {state.status === "error" && (
        <p
          role="alert"
          aria-live="polite"
          className="mb-3 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="Enter your email address"
          disabled={pending}
          className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 disabled:opacity-50 sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={pending}
          aria-disabled={pending}
          className="shrink-0 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        No spam. Unsubscribe at any time.
      </p>
    </form>
  );
}
