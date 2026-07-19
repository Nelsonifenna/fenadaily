import type { HeadToHead } from "@/football/types";

export function H2HList({ h2h }: { h2h: HeadToHead }) {
  if (h2h.meetings.length === 0) return null;

  return (
    <div className="space-y-2">
      {h2h.meetings.slice(0, 5).map((m, i) => (
        <div
          key={`${m.date}-${i}`}
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm"
        >
          <span className="text-zinc-300">
            {m.homeTeam.name} <span className="font-semibold text-white">{m.score.home ?? "–"}-{m.score.away ?? "–"}</span> {m.awayTeam.name}
          </span>
          <span className="text-xs text-zinc-500">
            {new Date(m.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {m.competitionName ? ` · ${m.competitionName}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
