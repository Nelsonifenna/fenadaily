"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { processUnsubscribe, type UnsubscribeState } from "./actions";

const initial: UnsubscribeState = { status: "idle" };

function UnsubscribeForm() {
  const params = useSearchParams();
  const email  = params.get("email") ?? "";
  const token  = params.get("token") ?? "";

  const [state, action, pending] = useActionState(processUnsubscribe, initial);

  if (!email || !token) {
    return (
      <div className="text-center">
        <p className="text-zinc-400">This unsubscribe link is missing required information.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
        >
          Back to Fena Daily
        </Link>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="rounded-xl border border-green-400/20 bg-green-400/10 px-6 py-5 text-center"
      >
        <p className="flex items-center justify-center gap-2 font-semibold text-green-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          You&apos;ve been unsubscribed.
        </p>
        <p className="mt-2 text-sm text-green-400/80">
          {email} has been removed from the Fena Daily newsletter.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:border-white/30 hover:text-white transition-colors"
        >
          Back to Fena Daily
        </Link>
      </div>
    );
  }

  return (
    <form action={action} noValidate>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />

      {state.status === "error" && (
        <p
          role="alert"
          aria-live="polite"
          className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {state.message}
        </p>
      )}

      <p className="text-sm text-zinc-400">
        You are about to unsubscribe{" "}
        <span className="font-medium text-white">{email}</span>{" "}
        from the Fena Daily newsletter.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          aria-disabled={pending}
          className="rounded-full bg-red-500/80 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          {pending ? "Unsubscribing…" : "Confirm unsubscribe"}
        </button>
        <Link
          href="/"
          className="rounded-full border border-white/10 px-6 py-3 text-center text-sm font-medium text-zinc-300 hover:border-white/30 hover:text-white transition-colors"
        >
          Keep my subscription
        </Link>
      </div>
    </form>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#08111f_0%,#111827_45%,#020617_100%)] text-white">
      <div className="mx-auto max-w-lg px-4 py-16 sm:py-24 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/85 p-6 shadow-2xl shadow-black/30 sm:rounded-[32px] sm:p-10">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Newsletter</p>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            Unsubscribe
          </h1>
          <div className="mt-6">
            <Suspense fallback={<p className="text-zinc-400 text-sm">Loading…</p>}>
              <UnsubscribeForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
