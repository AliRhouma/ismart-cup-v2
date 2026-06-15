import { toast } from "sonner"
import { ListPlus, Pencil, Users } from "lucide-react"
import Avatar from "@/components/kit/Avatar"
import { cn } from "@/lib/utils"
import { usePhases } from "@/stores/usePhases"
import type { Match, PhaseGroup } from "@/data/types"
import { computeGroupStandings, matchWinner, signedDiff, type PointsRules } from "./phaseHelpers"

/**
 * Group standings table (design system §6) — Position · Équipe · MJ · V · N · D ·
 * DB · Pts, COMPUTED from the group's matches. Below it: the group's fixtures
 * with inline result entry, or a "Générer les rencontres" CTA once the group is
 * full. Entering a result recomputes the table live.
 */
interface GroupTableProps {
  phaseId: string
  group: PhaseGroup
  /** The phase's matches (filtered to this group by name inside). */
  phaseMatches: Match[]
  teamName: Map<string, string>
  points: PointsRules
  onEnterResult: (match: Match) => void
}

const NUM_TH = "px-2 py-2.5 text-center"
const NUM_TD = "px-2 py-2.5 text-center tabular-nums text-ink-subtle"

export default function GroupTable({ phaseId, group, phaseMatches, teamName, points, onEnterResult }: GroupTableProps) {
  const generateGroupMatches = usePhases((s) => s.generateGroupMatches)

  const groupMatches = phaseMatches.filter((m) => m.group === group.name)
  const standings = computeGroupStandings(group, groupMatches, points)
  const played = groupMatches.filter((m) => m.status === "COMPLETED" || m.status === "FORFEIT").length
  const hasTeams = standings.length > 0
  const full = group.slots.every((s) => s != null)
  const placed = group.slots.filter(Boolean).length

  function handleGenerate() {
    generateGroupMatches(phaseId, group.id)
    toast.success(`Rencontres générées pour ${group.name}.`)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h3 className="font-semibold text-ink">{group.name}</h3>
        <span className="text-xs text-ink-muted">
          {groupMatches.length === 0 ? "Aucune rencontre" : `${played} / ${groupMatches.length} jouées`}
        </span>
      </div>

      {hasTeams ? (
        <table className="w-full text-sm">
          <thead className="bg-surface-muted">
            <tr className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              <th className="w-10 px-3 py-2.5 text-center">#</th>
              <th className="px-3 py-2.5 text-left">Équipe</th>
              <th className={NUM_TH}>MJ</th>
              <th className={NUM_TH}>V</th>
              <th className={NUM_TH}>N</th>
              <th className={NUM_TH}>D</th>
              <th className={NUM_TH}>DB</th>
              <th className="px-3 py-2.5 text-center">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {standings.map((r, i) => {
              const leader = i === 0 && played > 0
              return (
                <tr key={r.teamId} className={cn("transition", leader && "bg-brand-50/40")}>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={cn(
                        "inline-grid size-6 place-items-center rounded-full text-xs font-semibold tabular-nums",
                        leader ? "bg-brand-500 text-brand-foreground" : "text-ink-muted",
                      )}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={teamName.get(r.teamId) ?? "?"} size="sm" />
                      <span className="truncate font-medium text-ink">{teamName.get(r.teamId) ?? r.teamId}</span>
                    </div>
                  </td>
                  <td className={NUM_TD}>{r.played}</td>
                  <td className={NUM_TD}>{r.won}</td>
                  <td className={NUM_TD}>{r.drawn}</td>
                  <td className={NUM_TD}>{r.lost}</td>
                  <td className={cn(NUM_TD, r.goalDiff > 0 && "text-success-600", r.goalDiff < 0 && "text-danger-600")}>
                    {signedDiff(r.goalDiff)}
                  </td>
                  <td className="px-3 py-2.5 text-center text-base font-bold tabular-nums text-ink">{r.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-neutral-100 text-ink-muted">
            <Users className="size-4" />
          </span>
          <p className="text-sm text-ink-muted">Aucune équipe placée dans cette poule.</p>
        </div>
      )}

      {/* Fixtures + result entry */}
      <div className="border-t border-border px-4 py-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h4 className="text-xs font-medium uppercase tracking-wide text-ink-muted">Rencontres</h4>
          {groupMatches.length === 0 && full && (
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-brand-200 px-2.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
            >
              <ListPlus className="size-3.5" /> Générer les rencontres
            </button>
          )}
        </div>

        {groupMatches.length === 0 ? (
          <p className="py-1 text-sm text-ink-muted">
            {full
              ? "Générez les rencontres pour saisir les résultats."
              : `Complétez la poule (${placed}/${group.slots.length}) pour générer les rencontres.`}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {groupMatches.map((m) => {
              const w = matchWinner(m)
              const decided = m.status === "COMPLETED" || m.status === "FORFEIT"
              return (
                <li key={m.id} className="flex items-center gap-2 py-2 text-sm">
                  <span className={cn("min-w-0 flex-1 truncate text-right", w === 1 ? "font-semibold text-ink" : "text-ink-subtle")}>
                    {m.team1Id ? (teamName.get(m.team1Id) ?? "?") : "?"}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                      decided ? "bg-neutral-100 text-ink" : "text-ink-muted",
                    )}
                  >
                    {decided ? `${m.score1 ?? 0} - ${m.score2 ?? 0}` : "vs"}
                  </span>
                  <span className={cn("min-w-0 flex-1 truncate", w === 2 ? "font-semibold text-ink" : "text-ink-subtle")}>
                    {m.team2Id ? (teamName.get(m.team2Id) ?? "?") : "?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEnterResult(m)}
                    aria-label="Saisir le résultat"
                    className="grid size-7 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-neutral-100 hover:text-ink"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
