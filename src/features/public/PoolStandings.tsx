import { Link } from "react-router-dom"
import { Trophy } from "lucide-react"
import Avatar from "@/components/kit/Avatar"
import { cn } from "@/lib/utils"
import { usePublicLinks } from "./usePublicLinks"
import type { PoolView, StandingRow } from "./mock"

/**
 * One standings card per pool — the spectator's "who's winning" answer.
 *
 * Mobile-first: below `md` it is NOT a cramped 8-column table but a stack of
 * comfortable rows — rank + crest + name on the left, big Pts on the right, and
 * one muted micro-line carrying the rest (J · V-N-D · diff). From `md` up the
 * secondary columns unfold into a real table. Leader tinted, top-2 (qualified)
 * get a brand rail. Each team row links to that team's page.
 */

const NUM = "px-2 py-3 text-center tabular-nums text-ink-subtle"
const NUM_TH = "px-2 py-2.5 text-center font-medium"
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0")
const diffClass = (n: number) => (n > 0 ? "text-success-600" : n < 0 ? "text-danger-600" : "text-ink-muted")

export default function PoolStandings({ pool, highlightTeamId }: { pool: PoolView; highlightTeamId?: string }) {
  const playedAny = pool.rows.some((r) => r.played > 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
        <h3 className="font-semibold text-ink">{pool.name}</h3>
        <span className="text-xs text-ink-muted">{pool.rows.length} équipes</span>
      </div>

      {!playedAny ? (
        <p className="px-5 py-8 text-center text-sm text-ink-muted">
          Le classement s'affichera dès les premiers résultats.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="hidden bg-surface-muted text-xs uppercase tracking-wide text-ink-muted md:table-header-group">
            <tr>
              <th className="w-12 px-2 py-2.5 text-center font-medium">#</th>
              <th className="px-3 py-2.5 text-left font-medium">Équipe</th>
              <th className={NUM_TH}>J</th>
              <th className={NUM_TH}>V</th>
              <th className={NUM_TH}>N</th>
              <th className={NUM_TH}>D</th>
              <th className={cn(NUM_TH, "hidden lg:table-cell")}>BP</th>
              <th className={cn(NUM_TH, "hidden lg:table-cell")}>BC</th>
              <th className={NUM_TH}>DB</th>
              <th className="px-3 py-2.5 text-center font-semibold text-ink-subtle">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pool.rows.map((r, i) => (
              <Row key={r.team.id} row={r} rank={i + 1} leader={i === 0} highlight={r.team.id === highlightTeamId} />
            ))}
          </tbody>
        </table>
      )}

      {playedAny && pool.rows.some((r) => r.qualified) && (
        <div className="flex items-center gap-2 border-t border-border px-4 py-2.5 text-xs text-ink-muted sm:px-5">
          <span className="h-3 w-1 rounded-full bg-brand-500" />
          Qualifié pour les demi-finales
        </div>
      )}
    </div>
  )
}

function Row({ row, rank, leader, highlight }: { row: StandingRow; rank: number; leader: boolean; highlight: boolean }) {
  const links = usePublicLinks()
  return (
    <tr className={cn("transition", highlight ? "bg-accent2-50/60" : leader && "bg-brand-50/50")}>
      <td className="py-3 pl-3 pr-1 align-middle md:px-2 md:text-center">
        <div className="flex items-center gap-2">
          <span aria-hidden className={cn("h-7 w-1 shrink-0 rounded-full", row.qualified ? "bg-brand-500" : "bg-transparent")} />
          <span
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums",
              leader ? "bg-brand-500 text-brand-foreground" : "text-ink-muted",
            )}
          >
            {rank}
          </span>
        </div>
      </td>

      <td className="py-3 pr-2 md:px-3">
        <Link to={links.team(row.team.id)} className="flex min-w-0 items-center gap-2.5 rounded-md transition hover:opacity-80">
          <Avatar name={row.team.name} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-medium text-ink">{row.team.shortName}</span>
              {row.team.isHost && <Trophy aria-label="Équipe hôte" className="size-3 shrink-0 text-accent2-500" />}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted md:hidden">
              <span className="tabular-nums">{row.played} J</span>
              <span aria-hidden>·</span>
              <span className="tabular-nums">
                {row.won}V {row.drawn}N {row.lost}D
              </span>
              <span aria-hidden>·</span>
              <span className={cn("tabular-nums", diffClass(row.goalDiff))}>{signed(row.goalDiff)}</span>
            </div>
          </div>
        </Link>
      </td>

      <td className={cn(NUM, "hidden md:table-cell")}>{row.played}</td>
      <td className={cn(NUM, "hidden md:table-cell")}>{row.won}</td>
      <td className={cn(NUM, "hidden md:table-cell")}>{row.drawn}</td>
      <td className={cn(NUM, "hidden md:table-cell")}>{row.lost}</td>
      <td className={cn(NUM, "hidden lg:table-cell")}>{row.goalsFor}</td>
      <td className={cn(NUM, "hidden lg:table-cell")}>{row.goalsAgainst}</td>
      <td className={cn(NUM, "hidden md:table-cell", diffClass(row.goalDiff))}>{signed(row.goalDiff)}</td>

      <td className="py-3 pl-1 pr-4 text-right md:px-3 md:text-center">
        <span className="text-lg font-bold tabular-nums text-ink">{row.points}</span>
      </td>
    </tr>
  )
}
