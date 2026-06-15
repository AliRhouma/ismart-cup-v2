import { Fragment } from "react"
import { Check, ChevronLeft, ChevronRight, Circle, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Match, Phase, PhaseStatus } from "@/data/types"
import { matchesOfPhase, phaseCheckpoints, phaseSummary } from "./phaseHelpers"

/**
 * Horizontal phase navigator — echoes the design system's stepper (numbered
 * circles + connectors) so it reads as the tournament's chronological flow.
 * Each card shows the phase's config summary + three derived checkpoints, the
 * fix for the cramped "1-3/11" pager. Navigation + reorder live here; rename /
 * delete live in the panel header (a dropdown inside this overflow-x container
 * would be clipped).
 */

interface PhaseRailProps {
  phases: Phase[] // already sorted by order
  matches: Match[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (id: string, direction: "up" | "down") => void
  onCreate: () => void
}

const circleCls = (status: PhaseStatus) => {
  if (status === "done") return "bg-brand-500 text-brand-foreground"
  if (status === "current") return "bg-brand-50 text-brand-600 ring-2 ring-brand-200"
  return "bg-neutral-100 text-ink-muted"
}

function Checkpoint({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", ok ? "text-success-600" : "text-ink-muted")}>
      {ok ? <Check className="size-3" /> : <Circle className="size-3" />}
      {label}
    </span>
  )
}

export default function PhaseRail({
  phases,
  matches,
  selectedId,
  onSelect,
  onReorder,
  onCreate,
}: PhaseRailProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-stretch gap-2">
        {phases.map((phase, i) => {
          const pm = matchesOfPhase(matches, phase.id)
          const cp = phaseCheckpoints(phase, pm)
          const selected = phase.id === selectedId
          return (
            <Fragment key={phase.id}>
              {i > 0 && <div className="my-auto h-0.5 w-5 shrink-0 rounded-full bg-border" />}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(phase.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelect(phase.id)
                  }
                }}
                aria-pressed={selected}
                className={cn(
                  "flex w-56 shrink-0 cursor-pointer flex-col gap-2 rounded-xl border p-4 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-brand-300 bg-brand-50/50 ring-1 ring-brand-200"
                    : "border-border bg-surface hover:border-brand-200",
                )}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-full text-sm font-semibold",
                      circleCls(phase.status),
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={(e) => {
                        e.stopPropagation()
                        onReorder(phase.id, "up")
                      }}
                      aria-label="Déplacer à gauche"
                      className="grid size-7 place-items-center rounded-md text-ink-muted transition hover:bg-neutral-100 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={i === phases.length - 1}
                      onClick={(e) => {
                        e.stopPropagation()
                        onReorder(phase.id, "down")
                      }}
                      aria-label="Déplacer à droite"
                      className="grid size-7 place-items-center rounded-md text-ink-muted transition hover:bg-neutral-100 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>

                <h3 className="truncate font-semibold text-ink" title={phase.name}>
                  {phase.name}
                </h3>
                <p className="text-sm text-ink-muted">{phaseSummary(phase, pm)}</p>

                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-medium">
                  <Checkpoint ok={cp.configured} label="Config" />
                  <Checkpoint ok={cp.teamsAssigned} label="Équipes" />
                  <Checkpoint ok={cp.hasResults} label="Scores" />
                </div>
              </div>
            </Fragment>
          )
        })}

        {phases.length > 0 && <div className="my-auto h-0.5 w-5 shrink-0 rounded-full bg-border" />}

        <button
          type="button"
          onClick={onCreate}
          className="flex w-44 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-subtle p-4 text-sm font-medium text-ink-muted transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700"
        >
          <span className="grid size-8 place-items-center rounded-full bg-neutral-100 text-ink-muted">
            <Plus className="size-4" />
          </span>
          Créer une phase
        </button>
      </div>
    </div>
  )
}
