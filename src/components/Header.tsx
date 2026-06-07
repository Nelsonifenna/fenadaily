"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { NewsletterForm } from "@/components/NewsletterForm";
import { SearchForm } from "@/components/SearchForm";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const categoryLinks = [
  { label: "AI", href: "/category/ai" },
  { label: "Football", href: "/category/football" },
  { label: "Crypto", href: "/category/crypto" },
  { label: "Business", href: "/category/business" },
  { label: "Technology", href: "/category/technology" },
  { label: "Personal Growth", href: "/category/personal-growth" },
  { label: "Music", href: "/category/music" },
  { label: "Politics", href: "/category/politics" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close the subscribe / search dropdowns on route change
  useEffect(() => {
    setSubscribeOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!subscribeOpen && !searchOpen) return;
    function handle(e: MouseEvent) {
      if (subscribeOpen && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSubscribeOpen(false);
      }
      if (searchOpen && searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [subscribeOpen, searchOpen]);

  // Close on Escape
  useEffect(() => {
    if (!subscribeOpen && !searchOpen) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSubscribeOpen(false);
        setSearchOpen(false);
      }
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [subscribeOpen, searchOpen]);

  function isActivePrimary(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href;
  }

  function isActiveCategory(href: string) {
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl">
      {/* ── Primary bar ── */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8">
          {/* Brand */}
          <Link href="/" className="shrink-0">
            <span className="text-xl font-bold tracking-tight text-white">
              Fena Daily
            </span>
          </Link>

          {/* Desktop primary nav */}
          <nav aria-label="Primary">
            <ul className="hidden items-center gap-0.5 md:flex">
              {primaryLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`relative px-3.5 py-1.5 text-sm font-medium rounded-full transition-colors duration-150 ${
                      isActivePrimary(href)
                        ? "text-white bg-white/10"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop: Search + Subscribe */}
          <div className="hidden items-center gap-2 md:flex">
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen((o) => !o)}
              aria-expanded={searchOpen}
              aria-haspopup="dialog"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <SearchIcon />
            </button>

            {searchOpen && (
              <div
                role="dialog"
                aria-label="Search Fena Daily"
                aria-modal="false"
                className="absolute right-0 top-[calc(100%+10px)] z-50 w-80 rounded-2xl border border-white/10 bg-slate-900/98 p-4 shadow-2xl shadow-black/60 backdrop-blur-md"
              >
                <div
                  aria-hidden
                  className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 rounded-sm border-l border-t border-white/10 bg-slate-900"
                />
                <SearchForm compact />
              </div>
            )}
          </div>

          {/* Subscribe CTA with inline dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSubscribeOpen((o) => !o)}
              aria-expanded={subscribeOpen}
              aria-haspopup="dialog"
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Subscribe
            </button>

            {subscribeOpen && (
              <div
                role="dialog"
                aria-label="Subscribe to newsletter"
                aria-modal="false"
                className="absolute right-0 top-[calc(100%+10px)] z-50 w-80 rounded-2xl border border-white/10 bg-slate-900/98 p-5 shadow-2xl shadow-black/60 backdrop-blur-md"
              >
                {/* Caret */}
                <div
                  aria-hidden
                  className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 rounded-sm border-l border-t border-white/10 bg-slate-900"
                />
                <p className="text-sm font-semibold text-white">Stay informed. Stay ahead.</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Top stories across AI, Football, Crypto and more, straight to your inbox.
                </p>
                <NewsletterForm stacked />
              </div>
            )}
          </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-[5px] p-2 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`h-0.5 w-5 bg-white rounded-full transition-all duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 bg-white rounded-full transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 bg-white rounded-full transition-all duration-200 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Category / topics bar ── */}
      <div className="border-b border-white/[0.06] bg-slate-900/60">
        <div className="mx-auto hidden max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 scrollbar-none md:flex lg:px-8">
          <span className="mr-2 shrink-0 text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-medium">
            Topics
          </span>
          {categoryLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                isActiveCategory(href)
                  ? "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="border-b border-white/10 bg-slate-950 md:hidden">
          {/* Search */}
          <div className="px-4 pb-2 pt-4">
            <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-zinc-500">Search</p>
            <SearchForm compact />
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-white/8" />

          {/* Pages */}
          <div className="px-4 pb-2 pt-4">
            <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-zinc-500">Pages</p>
            <ul className="space-y-0.5">
              {primaryLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActivePrimary(href)
                        ? "bg-white/10 text-white"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-white/8" />

          {/* Categories */}
          <div className="px-4 pb-4 pt-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-zinc-500">Topics</p>
            <div className="flex flex-wrap gap-2">
              {categoryLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActiveCategory(href)
                      ? "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-white/8" />

          {/* Newsletter */}
          <div className="px-4 pb-6 pt-4">
            <p className="mb-1 text-[10px] uppercase tracking-[0.35em] text-zinc-500">Newsletter</p>
            <p className="mb-3 text-sm font-medium text-white">Stay informed. Stay ahead.</p>
            <NewsletterForm stacked />
          </div>
        </div>
      )}
    </header>
  );
}
