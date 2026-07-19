import type { MatchStatus } from "@/football/types";

const LABELS: Record<MatchStatus, string> = {
  scheduled: "Upcoming",
  live: "LIVE",
  paused: "Half-time",
  finished: "Full-time",
  postponed: "Postponed",
  cancelled: "Cancelled",
  unknown: "—",
};

const CLASSES: Record<MatchStatus, string> = {
  scheduled: "bg-white/5 text-zinc-300 ring-1 ring-white/10",
  live: "bg-red-500/15 text-red-300 ring-1 ring-red-400/30",
  paused: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30",
  finished: "bg-white/5 text-zinc-400 ring-1 ring-white/10",
  postponed: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30",
  cancelled: "bg-white/5 text-zinc-500 ring-1 ring-white/10",
  unknown: "bg-white/5 text-zinc-500 ring-1 ring-white/10",
};

export function MatchStatusBadge({ status, minute }: { status: MatchStatus; minute?: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${CLASSES[status]}`}>
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />}
      {status === "live" && minute ? `${minute}'` : LABELS[status]}
    </span>
  );
}
