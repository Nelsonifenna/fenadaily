"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

          {/* Spacer keeps brand left-aligned with nav centred */}
          <div className="hidden w-24 md:block" />

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
          <div className="px-4 pb-5 pt-3">
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
        </div>
      )}
    </header>
  );
}
