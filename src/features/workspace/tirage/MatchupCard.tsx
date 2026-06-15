import { useEffect, useRef, useState } from "react"
import { ArrowRight, ChevronDown, CircleDashed } from "lucide-react"
import Avatar from "@/components/kit/Avatar"
import Badge, { type BadgeVariant } from "@/components/kit/Badge"
import { cn } from "@/lib/utils"
import type { Match, MatchStatus, Team } from "@/data/types"
import { matchWinner } from "./phaseHelpers"

/**
 * Matchup card for KNOCKOUT / MATCHES phases. Each side is either an assigned
 * team or a dashed "À déterminer" placeholder — click a side to pick/clear a
 * team. Scores + penalties show when decided; "Saisir le résultat" opens the
 * result dialog (enabled once both sides are real teams). When a decided match
 * feeds a later slot (winner/loser source), a one-click "Pousser" resolves it.
 */
interface MatchupCardProps {
  match: Match
  teamName: Map<string, string>
  teams: Team[]
  resolutions: { outcome: "winner" | "loser"; label: string }[]
  onEnterResult: () => void
  onPush: (outcome: "winner" | "loser") => void
  onAssignSide: (side: 1 | 2, teamId: string | null) => void
}

const STATUS: Record<MatchStatus, { label: string; variant: BadgeVariant }> = {
  SCHEDULED: { label: "À venir", variant: "neutral" },
  IN_PROGRESS: { label: "En cours", variant: "warning" },
  COMPLETED: { label: "Terminé", variant: "success" },
  FORFEIT: { label: "Forfait", variant: "danger" },
  CANCELLED: { label: "Annulé", variant: "neutral" },
}

export default function MatchupCard({
  match,
  teamName,
  teams,
  resolutions,
  onEnterResult,
  onPush,
  onAssignSide,
}: MatchupCardProps) {
  const status = STATUS[match.status]
  const winner = matchWinner(match)
  const decided = match.status === "COMPLETED" || match.status === "FORFEIT"
  const bothTeams = !!match.team1Id && !!match.team2Id

  const [openSide, setOpenSide] = useState<1 | 2 | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!openSide) return
    function onDown(e: PointerEvent) {
      if (!(e.target as HTMLElement).closest("[data-side-picker]")) setOpenSide(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenSide(null)
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [openSide])

  function renderSide(side: 1 | 2) {
    const teamId = side === 1 ? match.team1Id : match.team2Id
    const placeholder = side === 1 ? match.team1Placeholder : match.team2Placeholder
    const isWinner = winner === side
    const open = openSide === side

    return (
      <div
        data-side-picker
        className={cn(
          "relative flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition",
          isWinner ? "bg-success-50" : "bg-surface-subtle",
        )}
      >
        <button
          type="button"
          onClick={() => setOpenSide(open ? null : side)}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-0.5 text-left transition hover:opacity-80"
        >
          {teamId ? (
            <>
              <Avatar name={teamName.get(teamId) ?? "?"} size="sm" />
              <span className={cn("truncate font-medium", isWinner ? "text-success-700" : "text-ink")}>
                {teamName.get(teamId) ?? teamId}
              </span>
            </>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1 text-xs text-ink-muted">
              <CircleDashed className="size-3.5 shrink-0" />
              <span className="truncate">{placeholder ?? "À déterminer"}</span>
            </span>
          )}
          <ChevronDown className="size-3.5 shrink-0 text-ink-muted" />
        </button>

        {decided && (
          <span className={cn("shrink-0 text-lg font-bold tabular-nums", isWinner ? "text-success-700" : "text-ink")}>
            {(side === 1 ? match.score1 : match.score2) ?? "—"}
          </span>
        )}

        {open && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface-raised p-1.5 shadow-lg">
            {teamId && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onAssignSide(side, null)
                    setOpenSide(null)
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink-muted transition hover:bg-neutral-100"
                >
                  <CircleDashed className="size-4" /> À déterminer
                </button>
                <div className="my-1 h-px bg-border" />
              </>
            )}
            {teams.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onAssignSide(side, t.id)
                  setOpenSide(null)
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition hover:bg-neutral-100",
                  teamId === t.id && "bg-brand-50",
                )}
              >
                <Avatar name={t.name} size="sm" />
                <span className="truncate text-ink">{t.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={cardRef} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {match.name ?? "Rencontre"}
        </span>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="space-y-1.5">
        {renderSide(1)}
        {renderSide(2)}
      </div>

      {match.hasPenalties && match.penaltyScore1 != null && match.penaltyScore2 != null && (
        <p className="mt-2.5 text-center text-xs text-ink-muted">
          Tirs au but : {match.penaltyScore1} – {match.penaltyScore2}
        </p>
      )}

      {(bothTeams || resolutions.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          {bothTeams && (
            <button
              type="button"
              onClick={onEnterResult}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-200 px-3 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
            >
              {decided ? "Modifier le résultat" : "Saisir le résultat"}
            </button>
          )}
          {resolutions.map((r) => (
            <button
              key={r.outcome}
              type="button"
              onClick={() => onPush(r.outcome)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700"
            >
              Pousser le {r.outcome === "winner" ? "vainqueur" : "perdant"}
              <ArrowRight className="size-4" />
              <span className="font-normal opacity-80">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
