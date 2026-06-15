import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AlertTriangle, Check, GitBranch, Minus, Plus, Swords, Table2, type LucideIcon } from "lucide-react"
import FormSheet from "@/components/kit/FormSheet"
import { cn } from "@/lib/utils"
import type { Phase, PhaseKind } from "@/data/types"
import type { PhaseConfig } from "@/stores/usePhases"

/**
 * Phase configurator — choose a format (three cards) then its config, with a
 * live capacity hint for GROUPS. Builds/rebuilds the structure via configurePhase.
 * Reconfiguring an already-configured phase resets its teams + matches (warned).
 */
interface PhaseConfigSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phase: Phase | null
  /** Current config for prefill (computed by the parent, which has the matches). */
  initialConfig: PhaseConfig | null
  /** Teams inscribed in the tournament — drives the capacity hint. */
  registeredTeams: number
  onSubmit: (config: PhaseConfig) => void
}

const TYPES: { kind: PhaseKind; icon: LucideIcon; title: string; desc: string }[] = [
  { kind: "GROUPS", icon: Table2, title: "Phase de poules", desc: "Des poules avec classements calculés." },
  { kind: "KNOCKOUT", icon: GitBranch, title: "Élimination directe", desc: "Des rencontres à élimination." },
  { kind: "MATCHES", icon: Swords, title: "Matchs", desc: "Des rencontres libres." },
]

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  const btn =
    "grid size-10 place-items-center text-ink-muted transition hover:bg-neutral-100 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink-subtle">{label}</span>
      <div className="inline-flex items-center rounded-lg border border-input bg-input-bg">
        <button type="button" aria-label="Diminuer" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className={btn}>
          <Minus className="size-4" />
        </button>
        <span className="w-12 text-center text-base font-semibold tabular-nums text-ink">{value}</span>
        <button type="button" aria-label="Augmenter" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className={btn}>
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}

export default function PhaseConfigSheet({
  open,
  onOpenChange,
  phase,
  initialConfig,
  registeredTeams,
  onSubmit,
}: PhaseConfigSheetProps) {
  const [kind, setKind] = useState<PhaseKind>("GROUPS")
  const [numberOfGroups, setNumberOfGroups] = useState(2)
  const [teamsPerGroup, setTeamsPerGroup] = useState(4)
  const [matchCount, setMatchCount] = useState(2) // shared by KNOCKOUT / MATCHES

  useEffect(() => {
    if (!open) return
    const c = initialConfig
    if (c?.kind === "GROUPS") {
      setKind("GROUPS")
      setNumberOfGroups(c.numberOfGroups)
      setTeamsPerGroup(c.teamsPerGroup)
    } else if (c?.kind === "KNOCKOUT") {
      setKind("KNOCKOUT")
      setMatchCount(c.numberOfMatchups)
    } else if (c?.kind === "MATCHES") {
      setKind("MATCHES")
      setMatchCount(c.numberOfMatches)
    } else {
      setKind("GROUPS")
      setNumberOfGroups(2)
      setTeamsPerGroup(4)
      setMatchCount(2)
    }
  }, [open, initialConfig])

  const isReconfigure = phase?.kind != null
  const totalPlaces = numberOfGroups * teamsPerGroup
  const capacityState = totalPlaces === registeredTeams ? "exact" : totalPlaces > registeredTeams ? "over" : "under"

  function handleSubmit() {
    let config: PhaseConfig
    if (kind === "GROUPS") {
      if (numberOfGroups < 1 || teamsPerGroup < 2) {
        toast.error("Configuration invalide : au moins 1 poule de 2 équipes.")
        throw new Error("validation")
      }
      config = { kind: "GROUPS", numberOfGroups, teamsPerGroup }
    } else if (kind === "KNOCKOUT") {
      if (matchCount < 1) {
        toast.error("Au moins une rencontre est requise.")
        throw new Error("validation")
      }
      config = { kind: "KNOCKOUT", numberOfMatchups: matchCount }
    } else {
      if (matchCount < 1) {
        toast.error("Au moins un match est requis.")
        throw new Error("validation")
      }
      config = { kind: "MATCHES", numberOfMatches: matchCount }
    }
    onSubmit(config)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isReconfigure ? "Reconfigurer la phase" : "Configurer la phase"}
      description={
        phase
          ? `Définissez le format de « ${phase.name} » et sa structure.`
          : "Définissez le format de la phase et sa structure."
      }
      submitLabel={isReconfigure ? "Appliquer" : "Configurer"}
      onSubmit={handleSubmit}
    >
      {/* Format */}
      <div>
        <span className="mb-2 block text-sm font-medium text-ink-subtle">Format de la phase</span>
        <div className="grid grid-cols-1 gap-2.5">
          {TYPES.map((t) => {
            const active = kind === t.kind
            return (
              <button
                key={t.kind}
                type="button"
                onClick={() => setKind(t.kind)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5 text-left transition",
                  active ? "border-brand-300 bg-brand-50/60 ring-1 ring-brand-200" : "border-border bg-surface hover:border-brand-200",
                )}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-lg",
                    active ? "bg-brand-100 text-brand-700" : "bg-neutral-100 text-ink-muted",
                  )}
                >
                  <t.icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("font-semibold", active ? "text-brand-700" : "text-ink")}>{t.title}</p>
                  <p className="text-xs text-ink-muted">{t.desc}</p>
                </div>
                {active && <Check className="size-5 shrink-0 text-brand-600" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Per-type config */}
      {kind === "GROUPS" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <Stepper label="Nombre de poules" value={numberOfGroups} onChange={setNumberOfGroups} min={1} max={16} />
            <Stepper label="Équipes par poule" value={teamsPerGroup} onChange={setTeamsPerGroup} min={2} max={12} />
          </div>
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg px-4 py-2.5 text-sm",
              capacityState === "exact" ? "bg-success-50 text-success-700" : "bg-warning-50 text-warning-700",
            )}
          >
            {capacityState === "exact" ? <Check className="mt-0.5 size-4 shrink-0" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
            <span>
              <span className="font-semibold">{totalPlaces} places</span> pour {registeredTeams} équipes inscrites
              {capacityState === "over" && " — des places resteront vides."}
              {capacityState === "under" && " — certaines équipes ne seront pas placées."}
              {capacityState === "exact" && " — capacité idéale."}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <Stepper
            label={kind === "KNOCKOUT" ? "Nombre de rencontres" : "Nombre de matchs"}
            value={matchCount}
            onChange={setMatchCount}
            min={1}
            max={64}
          />
          <p className="mt-2 text-xs text-ink-muted">
            Jusqu'à {matchCount * 2} équipes — les côtés non assignés resteront « À déterminer ».
          </p>
        </div>
      )}

      {isReconfigure && (
        <div className="flex items-start gap-2 rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-700">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>La reconfiguration réinitialise les équipes placées et les rencontres de cette phase.</span>
        </div>
      )}
    </FormSheet>
  )
}
