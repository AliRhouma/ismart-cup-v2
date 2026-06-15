import type { ReactNode } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { CalendarDays, Flag, MapPin } from "lucide-react"
import Avatar from "@/components/kit/Avatar"
import Badge from "@/components/kit/Badge"
import { cn } from "@/lib/utils"
import DetailHeader from "./DetailHeader"
import { usePublicLinks } from "./usePublicLinks"
import { formatDayLabel, getMatchDetail, resolveStatus, type MatchEvent, type MatchView, type SideView } from "./mock"

/** Match detail — score header + goal-by-goal timeline (played) or kickoff card (à venir). */
export default function MatchDetailPage() {
  const { matchId } = useParams()
  const [params] = useSearchParams()
  const status = resolveStatus(params.get("state"))
  const match = getMatchDetail(matchId ?? "", status)

  return (
    <div className="min-h-screen bg-surface-subtle">
      <DetailHeader status={status} />
      <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6">
        {!match ? (
          <NotFound />
        ) : (
          <>
            <ScoreHeader m={match} />
            <div className="mt-6">
              {match.forfeit ? (
                <Note>Match gagné par forfait — aucune feuille de match.</Note>
              ) : match.played ? (
                match.events.length > 0 ? (
                  <Timeline m={match} />
                ) : (
                  <Note>Aucun événement enregistré pour ce match.</Note>
                )
              ) : (
                <Note>Match à venir — le coup d'envoi est prévu à {match.time}.</Note>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function NotFound() {
  const links = usePublicLinks()
  return (
    <div className="rounded-2xl border border-border bg-surface p-10 text-center">
      <p className="text-sm text-ink-muted">Match introuvable.</p>
      <Link to={links.home} className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">
        Retour à l'accueil
      </Link>
    </div>
  )
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface/60 px-4 py-8 text-center text-sm text-ink-muted">
      {children}
    </div>
  )
}

function SideColumn({ side, isWinner }: { side: SideView; isWinner: boolean }) {
  const links = usePublicLinks()
  const tbd = side.kind === "tbd"
  const inner = (
    <div className="flex flex-col items-center gap-2 text-center">
      {tbd ? (
        <span className="grid size-14 place-items-center rounded-full border border-dashed border-border text-ink-muted">?</span>
      ) : (
        <Avatar name={side.team.name} size="lg" />
      )}
      <span className={cn("line-clamp-2 text-sm font-semibold", tbd ? "italic text-ink-muted" : isWinner ? "text-ink" : "text-ink-subtle")}>
        {tbd ? side.label : side.team.name}
      </span>
    </div>
  )
  return tbd ? <div className="flex-1">{inner}</div> : <Link to={links.team(side.team.id)} className="flex-1 transition hover:opacity-80">{inner}</Link>
}

function ScoreHeader({ m }: { m: MatchView }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-center">
        <Badge variant={m.phaseLabel.startsWith("Finale") ? "accent" : m.phaseLabel.startsWith("Demi") ? "info" : m.phaseLabel.startsWith("Poule") ? "brand" : "neutral"}>
          {m.phaseLabel}
        </Badge>
      </div>
      <div className="flex items-start gap-3">
        <SideColumn side={m.side1} isWinner={m.winner === 1} />
        <div className="flex shrink-0 flex-col items-center px-1 pt-2">
          {m.played ? (
            <div className="flex items-center gap-2 text-3xl font-bold tabular-nums text-ink sm:text-4xl">
              <span className={cn(m.winner === 1 ? "text-ink" : "text-ink-muted")}>{m.score1}</span>
              <span className="text-ink-muted">-</span>
              <span className={cn(m.winner === 2 ? "text-ink" : "text-ink-muted")}>{m.score2}</span>
            </div>
          ) : (
            <>
              <span className="text-2xl font-bold tabular-nums text-brand-700">{m.time}</span>
              <span className="text-[11px] text-ink-muted">VS</span>
            </>
          )}
          {m.forfeit && <span className="mt-1 rounded-full bg-warning-50 px-2 py-0.5 text-[11px] font-medium text-warning-700">Forfait</span>}
        </div>
        <SideColumn side={m.side2} isWinner={m.winner === 2} />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-border pt-4 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" /> {formatDayLabel(m.date)} · {m.time}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" /> {m.stadium}
        </span>
      </div>
    </div>
  )
}

const periodOf = (min: number) => (min <= 12 ? 1 : min <= 24 ? 2 : 3)
const PERIOD_LABEL = ["", "1ʳᵉ période", "2ᵉ période", "3ᵉ période"]

function GoalMark() {
  return <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full bg-success-50"><span className="size-2 rounded-full bg-success-500" /></span>
}
function CardMark() {
  return <span aria-hidden className="h-4 w-3 shrink-0 rounded-[2px] bg-warning-400" />
}

function EventContent({ e, side }: { e: MatchEvent; side: 1 | 2 }) {
  const left = side === 1
  return (
    <div className={cn("flex items-start gap-2", left ? "flex-row-reverse text-right" : "text-left")}>
      {e.type === "goal" ? <GoalMark /> : <CardMark />}
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{e.player}</p>
        {e.type === "goal" && e.assist && <p className="text-xs text-ink-muted">passe déc. · {e.assist}</p>}
        {e.type === "yellow" && <p className="text-xs text-ink-muted">Carton jaune</p>}
      </div>
    </div>
  )
}

function Timeline({ m }: { m: MatchView & { events: MatchEvent[] } }) {
  const items = m.events.map((e, i) => ({
    e,
    period: periodOf(e.minute),
    newPeriod: periodOf(e.minute) !== (i > 0 ? periodOf(m.events[i - 1].minute) : 0),
  }))
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">Déroulé du match</h2>
      <div className="relative">
        <div aria-hidden className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
        <div className="space-y-1">
          {items.map(({ e, period, newPeriod }, i) => {
            const onLeft = e.side === 1
            return (
              <div key={i}>
                {newPeriod && (
                  <div className="relative py-2 text-center">
                    <span className="relative z-10 inline-block rounded-full bg-surface-muted px-3 py-0.5 text-xs font-medium text-ink-muted">
                      {PERIOD_LABEL[period]}
                    </span>
                  </div>
                )}
                <div className="relative grid grid-cols-2 items-center gap-x-7 py-1.5 sm:gap-x-10">
                  <div className="min-w-0">{onLeft && <EventContent e={e} side={1} />}</div>
                  <div className="min-w-0">{!onLeft && <EventContent e={e} side={2} />}</div>
                  <span className="absolute left-1/2 top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface text-[11px] font-semibold tabular-nums text-ink-subtle">
                    {e.minute}'
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 border-t border-border pt-3 text-xs text-ink-muted">
        <Flag className="size-3.5" /> Fin du match
      </p>
    </div>
  )
}
