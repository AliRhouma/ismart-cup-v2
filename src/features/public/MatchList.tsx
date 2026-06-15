import MatchCard from "./MatchCard"
import { groupByDay, type MatchView } from "./mock"

/**
 * A list of matches grouped by calendar day (day header + responsive 2-up grid
 * of clickable cards). Used by the Résultats, Matchs and Accueil views.
 */
export default function MatchList({ matches, empty }: { matches: MatchView[]; empty: string }) {
  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/60 px-4 py-10 text-center text-sm text-ink-muted">
        {empty}
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {groupByDay(matches).map((day) => (
        <div key={day.date}>
          <h3 className="mb-2.5 text-sm font-semibold text-ink-subtle">{day.label}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {day.matches.map((m) => (
              <MatchCard key={m.id} m={m} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
