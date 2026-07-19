import type { StandingRow } from "@/football/types";

export function StandingsTable({
  rows,
  highlightTeamIds = [],
}: {
  rows: StandingRow[];
  highlightTeamIds?: string[];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="py-2 pr-2 font-medium">#</th>
            <th className="py-2 pr-2 font-medium">Team</th>
            <th className="py-2 pr-2 text-center font-medium">P</th>
            <th className="py-2 pr-2 text-center font-medium">W</th>
            <th className="py-2 pr-2 text-center font-medium">D</th>
            <th className="py-2 pr-2 text-center font-medium">L</th>
            <th className="py-2 pr-2 text-center font-medium">GD</th>
            <th className="py-2 pl-2 text-center font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const highlighted = highlightTeamIds.includes(row.team.id);
            return (
              <tr
                key={row.team.id}
                className={`border-b border-white/5 ${highlighted ? "bg-amber-400/5 text-white" : "text-zinc-300"}`}
              >
                <td className="py-2 pr-2 text-zinc-500">{row.position}</td>
                <td className={`py-2 pr-2 ${highlighted ? "font-semibold text-amber-200" : ""}`}>{row.team.name}</td>
                <td className="py-2 pr-2 text-center">{row.played}</td>
                <td className="py-2 pr-2 text-center">{row.won}</td>
                <td className="py-2 pr-2 text-center">{row.draw}</td>
                <td className="py-2 pr-2 text-center">{row.lost}</td>
                <td className="py-2 pr-2 text-center">{row.goalDifference >= 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                <td className="py-2 pl-2 text-center font-semibold text-white">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
