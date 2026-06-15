import { useState } from "react"
import { ListOrdered } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePublicData } from "../PublicLayout"
import ViewSection from "../ViewSection"
import PoolStandings from "../PoolStandings"
import Bracket from "../Bracket"
import { phases } from "../mock"

/**
 * Classement — navigate between the tournament's phases. The segmented control
 * (full-width on mobile, inline on desktop) switches between the group-stage
 * pool tables and the knockout bracket; it defaults to whichever phase is most
 * relevant (the bracket once the tournament is finished). Team rows/cards link
 * to the team page.
 */
export default function StandingsView() {
  const { view } = usePublicData()
  const [phase, setPhase] = useState<string>(view.tournamentFinished ? "finals" : "groups")

  return (
    <ViewSection icon={ListOrdered} title="Classement" subtitle="Phases de poules et tableau final">
      {/* Phase selector */}
      <div className="mb-5 inline-flex w-full rounded-full bg-surface-muted p-1 sm:w-auto">
        {phases.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPhase(p.id)}
            aria-pressed={phase === p.id}
            className={cn(
              "h-9 flex-1 whitespace-nowrap rounded-full px-4 text-sm font-medium transition sm:flex-none",
              phase === p.id ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {phase === "groups" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {view.pools.map((pool) => (
            <PoolStandings key={pool.name} pool={pool} />
          ))}
        </div>
      ) : (
        <Bracket bracket={view.bracket} champion={view.champion} />
      )}
    </ViewSection>
  )
}
