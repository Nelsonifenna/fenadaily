import Link from "next/link";
import { COMPETITIONS } from "@/football/competitions";

const LINKS = [
  { label: "Overview", href: "/football" },
  { label: "Live Now", href: "/football/live" },
  { label: "Today", href: "/football/today" },
];

export function FootballSubNav() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
      {LINKS.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className="rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          {label}
        </Link>
      ))}
      <span className="mx-1 h-4 w-px bg-white/10" aria-hidden />
      {COMPETITIONS.map(({ slug, name }) => (
        <Link
          key={slug}
          href={`/football/competition/${slug}`}
          className="rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
