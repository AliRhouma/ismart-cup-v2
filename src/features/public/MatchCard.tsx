import { Link } from "react-router-dom"
import { CheckCircle2, ChevronRight, MapPin } from "lucide-react"
import Avatar from "@/components/kit/Avatar"
import Badge, { type BadgeVariant } from "@/components/kit/Badge"
import { cn } from "@/lib/utils"
import { usePublicLinks } from "./usePublicLinks"
import type { MatchView, SideView } from "./mock"

/**
 * A single, clickable match — two stacked team lines so it stays legible at
 * 360px with no horizontal scroll. Played matches show the score (winner bold)
 * and link to the match detail/timeline; upcoming matches show the kick-off
 * time. Undecided knockout sides read "À déterminer".
 */

function chipVariant(label: string): BadgeVariant {
  if (label.startsWith("Finale")) return "accent"
  if (label.startsWith("Demi")) return "info"
  if (label.startsWith("Poule")) return "brand"
  return "neutral"
}

function TeamLine({ side, score, played, isWinner }: { side: SideView; score: number; played: boolean; isWinner: boolean }) {
  const tbd = side.kind === "tbd"
  return (
    <div className="flex items-center gap-2.5">
      {tbd ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-dashed border-border text-ink-muted">
          ?
        </span>
      ) : (
        <Avatar name={side.team.name} size="sm" />
      )}
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          tbd ? "italic text-ink-muted" : isWinner ? "font-semibold text-ink" : "text-ink-subtle",
        )}
      >
        {tbd ? side.label : side.team.shortName}
      </span>
      {played && (
        <span
          className={cn(
            "w-6 shrink-0 text-right text-lg tabular-nums",
            isWinner ? "font-bold text-ink" : "font-medium text-ink-muted",
          )}
        >
          {score}
        </span>
      )}
    </div>
  )
}

export default function MatchCard({ m }: { m: MatchView }) {
  const links = usePublicLinks()
  return (
    <Link
      to={links.match(m.id)}
      className="group block rounded-xl border border-border bg-surface p-3.5 shadow-sm transition hover:border-brand-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-4"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <Badge variant={chipVariant(m.phaseLabel)}>{m.phaseLabel}</Badge>
        {m.played &&
          (m.forfeit ? (
            <Badge variant="warning">Forfait</Badge>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted">
              <CheckCircle2 className="size-3.5 text-success-500" /> Terminé
            </span>
          ))}
      </div>

      {m.played ? (
        <div className="space-y-2">
          <TeamLine side={m.side1} score={m.score1} played isWinner={m.winner === 1} />
          <TeamLine side={m.side2} score={m.score2} played isWinner={m.winner === 2} />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <TeamLine side={m.side1} score={m.score1} played={false} isWinner={false} />
            <TeamLine side={m.side2} score={m.score2} played={false} isWinner={false} />
          </div>
          <div className="shrink-0 rounded-lg bg-brand-50 px-3 py-1.5 text-center">
            <div className="text-sm font-bold tabular-nums text-brand-700">{m.time}</div>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-x-3 border-t border-border pt-2.5 text-xs text-ink-muted">
        <span className="inline-flex min-w-0 items-center gap-1">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{m.stadium}</span>
        </span>
        <span className="ml-auto inline-flex shrink-0 items-center gap-0.5 font-medium text-brand-600 opacity-0 transition group-hover:opacity-100">
          Détails <ChevronRight className="size-3.5" />
        </span>
      </div>
    </Link>
  )
}
