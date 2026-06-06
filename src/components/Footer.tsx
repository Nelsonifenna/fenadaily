import Link from "next/link";

const publicationLinks = [
  { label: "About Us", href: "/about" },
  { label: "Authors", href: "/authors" },
  { label: "Contact Us", href: "/contact" },
  { label: "Editorial Policy", href: "/editorial-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
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
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/">
              <p className="text-xl font-bold tracking-tight text-white">Fena Daily</p>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
              Independent insights on business, technology, AI, finance, personal growth, and the ideas shaping our world.
            </p>
            <p className="mt-4 text-xs italic text-zinc-600">
              Knowledge for curious, ambitious people.
            </p>
          </div>

          {/* Publication */}
          <div>
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-zinc-500">
              Publication
            </p>
            <ul className="space-y-2.5">
              {publicationLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-400 transition-colors hover:text-amber-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Topics */}
          <div>
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-zinc-500">
              Topics
            </p>
            <ul className="space-y-2.5">
              {categoryLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-400 transition-colors hover:text-amber-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Fena Daily. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/privacy-policy"
              className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
            >
              Privacy Policy
            </Link>
            <Link
              href="/editorial-policy"
              className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
            >
              Editorial Policy
            </Link>
            <Link
              href="/contact"
              className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
