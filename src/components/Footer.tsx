import Link from "next/link";

const pageLinks = [
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

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <p className="text-xl font-bold text-white">Fena Daily</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
              Independent coverage of AI, Football, Crypto, Business, Technology, Personal Growth, Music, and Politics.
            </p>
          </div>

          {/* Pages */}
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-medium">
              Pages
            </p>
            <ul className="space-y-2.5">
              {pageLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-400 hover:text-amber-300 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Topics */}
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-medium">
              Topics
            </p>
            <ul className="space-y-2.5">
              {categoryLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-400 hover:text-amber-300 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Fena Daily. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
