import { useEffect, useMemo, useRef, useState } from "react"
import { MoreVertical, Pencil, Settings2, SlidersHorizontal, Swords, Trash2, Users } from "lucide-react"
import Badge from "@/components/kit/Badge"
import EmptyState from "@/components/kit/EmptyState"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useMatches } from "@/stores/useMatches"
import type { Match, Phase, Team } from "@/data/types"
import {
  KIND_BADGE,
  UNCONFIGURED_BADGE,
  matchWinner,
  matchesOfPhase,
  phaseSummary,
  type PointsRules,
} from "./phaseHelpers"
import GroupTable from "./GroupTable"
import GroupComposition from "./GroupComposition"
import MatchupCard from "./MatchupCard"
import ResultDialog from "./ResultDialog"

/**
 * Focused panel for the selected phase: header (name + format badge + summary +
 * ⋮ rename/delete) and the phase content — real standings tables (GROUPS) or
 * matchup cards (KNOCKOUT/MATCHES), read-only for now. The configurator and the
 * interactive team-assignment / result-entry layers land in the next steps.
 */
interface PhasePanelProps {
  phase: Phase
  matches: Match[]
  teams: Team[]
  points: PointsRules
  onConfigure: (phase: Phase) => void
  onRename: (phase: Phase) => void
  onDelete: (phase: Phase) => void
}

export default function PhasePanel({ phase, matches, teams, points, onConfigure, onRename, onDelete }: PhasePanelProps) {
  const pm = matchesOfPhase(matches, phase.id)
  const badge = phase.kind ? KIND_BADGE[phase.kind] : UNCONFIGURED_BADGE
  const teamName = useMemo(() => new Map(teams.map((t) => [t.id, t.name])), [teams])

  const hasResults = pm.some((m) => m.status === "COMPLETED" || m.status === "FORFEIT")
  const [mode, setMode] = useState<"composition" | "classement">(hasResults ? "classement" : "composition")
  // Reset the view to the state-aware default when switching to a different phase.
  useEffect(() => {
    setMode(hasResults ? "classement" : "composition")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase.id])

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!menuOpen) return
    function onDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  // Result entry + manual winner/loser resolution (no automatic global solve).
  const updateMatch = useMatches((s) => s.updateMatch)
  const [resultMatch, setResultMatch] = useState<Match | null>(null)
  const tournamentMatches = matches.filter((m) => m.tournamentId === phase.tournamentId)

  function decidedTeams(m: Match): { winner: string | null; loser: string | null } {
    const w = matchWinner(m)
    if (!w || !m.team1Id || !m.team2Id) return { winner: null, loser: null }
    return w === 1 ? { winner: m.team1Id, loser: m.team2Id } : { winner: m.team2Id, loser: m.team1Id }
  }

  /** Outcomes of m that still feed an unresolved slot elsewhere — the push targets. */
  function resolutionsFor(m: Match): { outcome: "winner" | "loser"; label: string }[] {
    const { winner, loser } = decidedTeams(m)
    const out: { outcome: "winner" | "loser"; label: string }[] = []
    ;(["winner", "loser"] as const).forEach((outcome) => {
      const teamId = outcome === "winner" ? winner : loser
      if (!teamId) return
      const targets = tournamentMatches.filter(
        (t) =>
          (t.team1Source?.kind === outcome && t.team1Source.matchId === m.id && !t.team1Id) ||
          (t.team2Source?.kind === outcome && t.team2Source.matchId === m.id && !t.team2Id),
      )
      if (targets.length) out.push({ outcome, label: targets.map((t) => t.name ?? "Rencontre").join(", ") })
    })
    return out
  }

  function handlePush(m: Match, outcome: "winner" | "loser") {
    const { winner, loser } = decidedTeams(m)
    const teamId = outcome === "winner" ? winner : loser
    if (!teamId) return
    for (const t of tournamentMatches) {
      const patch: Partial<Match> = {}
      if (t.team1Source?.kind === outcome && t.team1Source.matchId === m.id && !t.team1Id) patch.team1Id = teamId
      if (t.team2Source?.kind === outcome && t.team2Source.matchId === m.id && !t.team2Id) patch.team2Id = teamId
      if (Object.keys(patch).length) updateMatch(t.id, patch)
    }
    toast.success(`${outcome === "winner" ? "Vainqueur" : "Perdant"} poussé : ${teamName.get(teamId) ?? ""}.`)
  }

  function handleAssignSide(m: Match, side: 1 | 2, teamId: string | null) {
    updateMatch(m.id, side === 1 ? { team1Id: teamId ?? undefined } : { team2Id: teamId ?? undefined })
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="truncate text-xl font-semibold tracking-tight text-ink">{phase.name}</h2>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-muted">{phaseSummary(phase, pm)}</p>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Actions de la phase"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="grid size-9 place-items-center rounded-lg text-ink-muted transition hover:bg-neutral-100 hover:text-ink"
          >
            <MoreVertical className="size-5" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-11 z-30 w-52 rounded-xl border border-border bg-surface-raised p-1.5 shadow-lg"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  onConfigure(phase)
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink transition hover:bg-neutral-100"
              >
                <Settings2 className="size-4 text-ink-muted" /> {phase.kind ? "Reconfigurer" : "Configurer"}
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  onRename(phase)
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink transition hover:bg-neutral-100"
              >
                <Pencil className="size-4 text-ink-muted" /> Renommer
              </button>
              <div className="my-1 h-px bg-border" />
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  onDelete(phase)
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-danger-600 transition hover:bg-danger-50"
              >
                <Trash2 className="size-4" /> Supprimer la phase
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        {!phase.kind ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="Phase à configurer"
            message="Choisissez un format — poules, élimination directe ou matchs — pour cette phase."
            action={
              <button
                onClick={() => onConfigure(phase)}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700"
              >
                <SlidersHorizontal className="size-4" /> Configurer la phase
              </button>
            }
          />
        ) : phase.kind === "GROUPS" ? (
          (phase.groups ?? []).length === 0 ? (
            <EmptyState icon={Users} title="Aucune poule" message="Cette phase de poules n'a pas encore de poule configurée." />
          ) : (
            <div>
              <div className="mb-4 flex justify-end">
                <div className="inline-flex rounded-full bg-surface-muted p-1">
                  {(["composition", "classement"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={cn(
                        "grid h-8 place-items-center rounded-full px-4 text-sm font-medium transition",
                        mode === m ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {m === "composition" ? "Composition" : "Classement"}
                    </button>
                  ))}
                </div>
              </div>
              {mode === "composition" ? (
                <GroupComposition phase={phase} teams={teams} />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {(phase.groups ?? []).map((g) => (
                    <GroupTable
                      key={g.id}
                      phaseId={phase.id}
                      group={g}
                      phaseMatches={pm}
                      teamName={teamName}
                      points={points}
                      onEnterResult={setResultMatch}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        ) : pm.length === 0 ? (
          <EmptyState icon={Swords} title="Aucune rencontre" message="Cette phase n'a pas encore de rencontre." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pm.map((m) => (
              <MatchupCard
                key={m.id}
                match={m}
                teamName={teamName}
                teams={teams}
                resolutions={resolutionsFor(m)}
                onEnterResult={() => setResultMatch(m)}
                onPush={(outcome) => handlePush(m, outcome)}
                onAssignSide={(side, teamId) => handleAssignSide(m, side, teamId)}
              />
            ))}
          </div>
        )}
      </div>

      <ResultDialog
        match={resultMatch}
        teamName={teamName}
        open={!!resultMatch}
        onOpenChange={(o) => !o && setResultMatch(null)}
      />
    </section>
  )
}
