import { Link } from "react-router-dom"
import { CalendarClock, CalendarDays, History, MapPin, Sparkles, Trophy } from "lucide-react"
import Avatar from "@/components/kit/Avatar"
import Badge from "@/components/kit/Badge"
import { cn } from "@/lib/utils"
import { usePublicData } from "../PublicLayout"
import { usePublicLinks } from "../usePublicLinks"
import ViewSection from "../ViewSection"
import MatchList from "../MatchList"
import { formatDayLabel, type MatchView, type SideView } from "../mock"

/**
 * Accueil — the default landing. Answers the fan's questions in order: a
 * featured "prochain match", then today's results and today's upcoming. Falls
 * back gracefully when there are no matches today (not started / finished / gap).
 */

function FeaturedSide({ side }: { side: SideView }) {
  const tbd = side.kind === "tbd"
  return (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      {tbd ? (
        <span className="grid size-12 place-items-center rounded-full border border-dashed border-border text-ink-muted">?</span>
      ) : (
        <Avatar name={side.team.name} size="lg" />
      )}
      <span className={cn("line-clamp-2 text-sm font-semibold", tbd ? "italic text-ink-muted" : "text-ink")}>
        {tbd ? side.label : side.team.shortName}
      </span>
    </div>
  )
}

function FeaturedNextMatch({ m }: { m: MatchView }) {
  const links = usePublicLinks()
  return (
    <Link
      to={links.match(m.id)}
      className="group block rounded-2xl border border-brand-200 bg-gradient-to-b from-brand-50/70 to-surface p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
          <CalendarClock className="size-4" /> Prochain match
        </span>
        <Badge variant="brand">{m.phaseLabel}</Badge>
      </div>
      <div className="flex items-center gap-3">
        <FeaturedSide side={m.side1} />
        <div className="flex shrink-0 flex-col items-center px-1">
          <span className="text-2xl font-bold tabular-nums text-brand-700">{m.time}</span>
          <span className="text-[11px] text-ink-muted">VS</span>
        </div>
        <FeaturedSide side={m.side2} />
      </div>
      <div className="mt-4 flex items-center justify-center gap-x-3 border-t border-border pt-3 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" /> {formatDayLabel(m.date)}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1">
          <MapPin className="size-3.5 shrink-0" /> <span className="truncate">{m.stadium}</span>
        </span>
      </div>
    </Link>
  )
}

export default function TodayView() {
  const { view } = usePublicData()
  const { today, nextMatch, recentResults, tournamentStarted, tournamentFinished, champion } = view
  const hasToday = today.results.length + today.upcoming.length > 0
  // Don't duplicate the next match if it's already in today's upcoming list.
  const featured = nextMatch && !today.upcoming.some((m) => m.id === nextMatch.id) ? nextMatch : null

  return (
    <div className="space-y-9">
      {hasToday ? (
        <>
          {featured && <FeaturedNextMatch m={featured} />}
          {today.upcoming.length > 0 && (
            <ViewSection icon={CalendarClock} title="À venir aujourd'hui" subtitle={view.todayLabel}>
              <MatchList matches={today.upcoming} empty="" />
            </ViewSection>
          )}
          {today.results.length > 0 && (
            <ViewSection icon={History} title="Résultats du jour" subtitle={view.todayLabel}>
              <MatchList matches={today.results} empty="" />
            </ViewSection>
          )}
        </>
      ) : !tournamentStarted ? (
        <>
          <div className="rounded-2xl border border-brand-200 bg-gradient-to-b from-brand-50/70 to-surface p-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-100 text-brand-600">
              <Sparkles className="size-6" />
            </span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink">Le tournoi commence bientôt</h2>
            <p className="mt-1 text-sm text-ink-muted">Premier coup d'envoi le {formatDayLabel(view.upcoming[0]?.date ?? "")}.</p>
          </div>
          {view.upcoming.length > 0 && (
            <ViewSection icon={CalendarDays} title="Premiers matchs" subtitle="Le programme d'ouverture">
              <MatchList matches={view.upcoming.slice(0, 4)} empty="" />
            </ViewSection>
          )}
        </>
      ) : (
        <>
          {tournamentFinished && champion && (
            <div className="rounded-2xl border border-accent2-200 bg-gradient-to-r from-accent2-50 to-surface p-6">
              <div className="flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent2-100 text-accent2-600">
                  <Trophy className="size-7" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent2-700">Champion</p>
                  <p className="truncate text-2xl font-bold tracking-tight text-ink">{champion.name}</p>
                </div>
              </div>
            </div>
          )}
          <ViewSection icon={History} title="Derniers résultats" subtitle="Les matchs les plus récents">
            <MatchList matches={recentResults} empty="Aucun résultat pour l'instant." />
          </ViewSection>
        </>
      )}
    </div>
  )
}
