import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Trophy } from "lucide-react"
import Avatar from "@/components/kit/Avatar"
import { cn } from "@/lib/utils"
import { usePublicLinks } from "./usePublicLinks"
import type { MatchView, PublicView, SideView } from "./mock"

/**
 * Knockout bracket for the "Phase finale".
 * Mobile/tablet: rounds stacked vertically (Demi-finales → Finale → 3ᵉ place).
 * Desktop (lg): a two-column bracket — semis on the left, the final centered on
 * the right with a connector — plus the 3rd-place match beneath. Each tie links
 * to its match detail. The final winner is crowned in gold.
 */

function BracketSide({ side, score, played, isWinner }: { side: SideView; score: number; played: boolean; isWinner: boolean }) {
  const tbd = side.kind === "tbd"
  return (
    <div className="flex items-center gap-2">
      {tbd ? (
        <span className="grid size-7 shrink-0 place-items-center rounded-full border border-dashed border-border text-xs text-ink-muted">?</span>
      ) : (
        <Avatar name={side.team.name} size="sm" />
      )}
      <span className={cn("min-w-0 flex-1 truncate text-sm", tbd ? "italic text-ink-muted" : isWinner ? "font-semibold text-ink" : "text-ink-subtle")}>
        {tbd ? side.label : side.team.shortName}
      </span>
      {played && (
        <span className={cn("w-5 shrink-0 text-right text-base tabular-nums", isWinner ? "font-bold text-ink" : "font-medium text-ink-muted")}>
          {score}
        </span>
      )}
    </div>
  )
}

function BracketMatch({ m, gold }: { m: MatchView; gold?: boolean }) {
  const links = usePublicLinks()
  return (
    <Link
      to={links.match(m.id)}
      className={cn(
        "block rounded-xl border bg-surface p-3 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        gold ? "border-accent2-200 ring-1 ring-accent2-100 hover:border-accent2-300" : "border-border hover:border-brand-300",
      )}
    >
      <div className="space-y-1.5">
        <BracketSide side={m.side1} score={m.score1} played={m.played} isWinner={m.winner === 1} />
        <div className="h-px bg-border" />
        <BracketSide side={m.side2} score={m.score2} played={m.played} isWinner={m.winner === 2} />
      </div>
      {!m.played && <p className="mt-2 text-center text-xs font-medium text-ink-muted">{m.time}</p>}
    </Link>
  )
}

function RoundTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">{children}</h3>
}

function ChampionLine({ team }: { team: NonNullable<PublicView["champion"]> }) {
  return (
    <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-accent2-50 px-3 py-2 text-sm font-semibold text-accent2-700">
      <Trophy className="size-4" /> Champion · {team.shortName}
    </div>
  )
}

export default function Bracket({ bracket, champion }: { bracket: PublicView["bracket"]; champion: PublicView["champion"] }) {
  const { semis, third, final } = bracket
  return (
    <div className="rounded-2xl border border-border bg-surface-subtle/40 p-4 sm:p-6">
      {/* Mobile / tablet — rounds stacked */}
      <div className="space-y-6 lg:hidden">
        <div>
          <RoundTitle>Demi-finales</RoundTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {semis.map((m) => (
              <BracketMatch key={m.id} m={m} />
            ))}
          </div>
        </div>
        {final && (
          <div>
            <RoundTitle>Finale</RoundTitle>
            <BracketMatch m={final} gold />
            {champion && <ChampionLine team={champion} />}
          </div>
        )}
        {third && (
          <div>
            <RoundTitle>Match pour la 3ᵉ place</RoundTitle>
            <BracketMatch m={third} />
          </div>
        )}
      </div>

      {/* Desktop — two-column bracket */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 gap-10">
          <div>
            <RoundTitle>Demi-finales</RoundTitle>
            <div className="flex flex-col justify-center gap-8">
              {semis.map((m) => (
                <div key={m.id} className="relative">
                  <BracketMatch m={m} />
                  {/* connector stub toward the final */}
                  <span aria-hidden className="absolute right-0 top-1/2 hidden h-px w-5 translate-x-full bg-border lg:block" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <RoundTitle>Finale</RoundTitle>
            {final && <BracketMatch m={final} gold />}
            {champion && <ChampionLine team={champion} />}
          </div>
        </div>
        {third && (
          <div className="mt-8 border-t border-border pt-6">
            <RoundTitle>Match pour la 3ᵉ place</RoundTitle>
            <div className="max-w-sm">
              <BracketMatch m={third} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
