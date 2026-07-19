import Link from "next/link";
import Image from "next/image";
import type { MatchSummary } from "@/football/types";
import { MatchStatusBadge } from "./MatchStatusBadge";

function TeamRow({ name, crestUrl, score }: { name: string; crestUrl?: string; score: number | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {crestUrl ? (
          <Image src={crestUrl} alt="" width={24} height={24} className="h-6 w-6 shrink-0 object-contain" unoptimized />
        ) : (
          <span className="h-6 w-6 shrink-0 rounded-full bg-white/10" aria-hidden />
        )}
        <span className="truncate text-sm font-medium text-white">{name}</span>
      </div>
      {score !== null && <span className="shrink-0 text-sm font-bold text-white">{score}</span>}
    </div>
  );
}

export function MatchCard({ match }: { match: MatchSummary }) {
  const kickoff = new Date(match.kickoff);
  const timeLabel = kickoff.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      href={`/football/watch/${match.slug}`}
      className="block rounded-2xl border border-white/10 bg-zinc-950/80 p-4 shadow-xl shadow-black/20 transition-colors hover:border-amber-400/25"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium uppercase tracking-wide text-amber-300">{match.competition.name}</span>
        <MatchStatusBadge status={match.status} minute={match.minute} />
      </div>
      <div className="space-y-2">
        <TeamRow name={match.homeTeam.name} crestUrl={match.homeTeam.crestUrl} score={match.score.home} />
        <TeamRow name={match.awayTeam.name} crestUrl={match.awayTeam.crestUrl} score={match.score.away} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <span>{match.status === "scheduled" ? `Kicks off ${timeLabel}` : match.venue?.name ?? ""}</span>
        <span className="font-medium text-amber-200">Details →</span>
      </div>
    </Link>
  );
}
