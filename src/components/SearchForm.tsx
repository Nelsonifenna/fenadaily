"use client";

import { useId } from "react";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export function SearchForm({
  defaultValue = "",
  compact = false,
}: {
  defaultValue?: string;
  compact?: boolean;
}) {
  const uid = useId();

  return (
    <form action="/search" role="search" className={compact ? "w-full" : "mt-2 w-full max-w-xl"}>
      <label htmlFor={`${uid}-q`} className="sr-only">
        Search articles
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-500">
          <SearchIcon />
        </span>
        <input
          id={`${uid}-q`}
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder="Search articles, topics, people…"
          autoComplete="off"
          className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
        />
      </div>
    </form>
  );
}
