import { useEffect, useState, type ReactNode } from "react"
import { toast } from "sonner"
import FormSheet from "@/components/kit/FormSheet"
import { cn } from "@/lib/utils"
import { useTournaments } from "@/stores/useTournaments"
import type { SurfaceType, Tournament, TournamentStatus } from "@/data/types"

/**
 * Slide-over editor for a tournament's general information (identity). Opened
 * from the workspace header (⋮ menu) so it's reachable on every tab. Reuses the
 * canonical FormSheet pattern — throw on validation to keep the sheet open.
 */

interface FormState {
  name: string
  description: string
  sport: string
  category: string
  status: TournamentStatus
  startDate: string
  endDate: string
  numberOfTeams: string
  numberOfPlayersPerTeam: string
  surfaceType: SurfaceType | ""
  address: string
}

const numStr = (n?: number) => (n == null ? "" : String(n))
const toNum = (s: string) => (s.trim() === "" ? undefined : Number(s))

const STATUS_OPTIONS: { value: TournamentStatus; label: string }[] = [
  { value: "upcoming", label: "À venir" },
  { value: "active", label: "Actif" },
  { value: "finished", label: "Terminé" },
]

const SURFACE_OPTIONS: { value: SurfaceType; label: string }[] = [
  { value: "NATURAL", label: "Naturel" },
  { value: "SYNTHETIC", label: "Synthétique" },
  { value: "MIXED", label: "Mixte" },
]

function toForm(t: Tournament): FormState {
  return {
    name: t.name ?? "",
    description: t.description ?? "",
    sport: t.sport ?? "",
    category: t.category ?? "",
    status: t.status ?? "upcoming",
    startDate: t.startDate ?? "",
    endDate: t.endDate ?? "",
    numberOfTeams: numStr(t.numberOfTeams),
    numberOfPlayersPerTeam: numStr(t.numberOfPlayersPerTeam),
    surfaceType: t.surfaceType ?? "",
    address: t.address ?? "",
  }
}

const INPUT =
  "h-11 w-full rounded-lg border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/30"
const SELECT =
  "h-11 w-full rounded-lg border border-input bg-input-bg px-3.5 text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/30"
const TEXTAREA =
  "min-h-[88px] w-full resize-y rounded-lg border border-input bg-input-bg px-3.5 py-2.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/30"

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-subtle">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-sm text-danger-600">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-ink-muted">{hint}</span>
      )}
    </label>
  )
}

interface TournamentInfoSheetProps {
  tournament: Tournament
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TournamentInfoSheet({
  tournament,
  open,
  onOpenChange,
}: TournamentInfoSheetProps) {
  const updateTournament = useTournaments((s) => s.updateTournament)
  const [form, setForm] = useState<FormState>(() => toForm(tournament))
  const [nameError, setNameError] = useState("")

  // The sheet stays mounted between opens — reseed the form each time it opens
  // so it always reflects the latest saved values (and discards stale edits).
  useEffect(() => {
    if (open) {
      setForm(toForm(tournament))
      setNameError("")
    }
  }, [open, tournament])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function handleSubmit() {
    if (!form.name.trim()) {
      setNameError("Le nom du tournoi est requis.")
      toast.error("Veuillez renseigner le nom du tournoi.")
      throw new Error("validation") // keeps the sheet open
    }
    if (!form.startDate) {
      toast.error("La date de début est requise.")
      throw new Error("validation")
    }
    if (form.endDate && form.endDate < form.startDate) {
      toast.error("La date de fin doit être postérieure à la date de début.")
      throw new Error("validation")
    }

    updateTournament(tournament.id, {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      sport: form.sport.trim() || undefined,
      category: form.category.trim() || undefined,
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      numberOfTeams: toNum(form.numberOfTeams),
      numberOfPlayersPerTeam: toNum(form.numberOfPlayersPerTeam),
      surfaceType: form.surfaceType || undefined,
      address: form.address.trim() || undefined,
    })
    toast.success("Informations enregistrées.")
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Modifier le tournoi"
      description="Mettez à jour les informations générales de ce tournoi."
      submitLabel="Enregistrer"
      onSubmit={handleSubmit}
    >
      <Field label="Nom du tournoi" error={nameError}>
        <input
          value={form.name}
          onChange={(e) => {
            set("name", e.target.value)
            if (nameError) setNameError("")
          }}
          placeholder="Ex. Coupe de Printemps"
          autoFocus
          className={cn(INPUT, nameError && "border-danger-500 focus:border-danger-500")}
        />
      </Field>

      <Field label="Description" hint="Courte présentation affichée sur l'aperçu.">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Ex. Tournoi de football à 12 équipes : phase de poules puis finale."
          className={TEXTAREA}
        />
      </Field>

      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <Field label="Discipline">
          <input value={form.sport} onChange={(e) => set("sport", e.target.value)} placeholder="Football" className={INPUT} />
        </Field>
        <Field label="Catégorie">
          <input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Senior" className={INPUT} />
        </Field>

        <Field label="Statut">
          <select value={form.status} onChange={(e) => set("status", e.target.value as TournamentStatus)} className={SELECT}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type de surface">
          <select
            value={form.surfaceType}
            onChange={(e) => set("surfaceType", e.target.value as SurfaceType | "")}
            className={SELECT}
          >
            <option value="">Non précisé</option>
            {SURFACE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date de début">
          <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={INPUT} />
        </Field>
        <Field label="Date de fin">
          <input
            type="date"
            value={form.endDate}
            min={form.startDate || undefined}
            onChange={(e) => set("endDate", e.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Nombre d'équipes" hint="Capacité — le dénominateur de « X / Y inscrites ».">
          <input
            type="number"
            min={1}
            value={form.numberOfTeams}
            onChange={(e) => set("numberOfTeams", e.target.value)}
            placeholder="12"
            className={INPUT}
          />
        </Field>
        <Field label="Joueurs par équipe">
          <input
            type="number"
            min={1}
            value={form.numberOfPlayersPerTeam}
            onChange={(e) => set("numberOfPlayersPerTeam", e.target.value)}
            placeholder="11"
            className={INPUT}
          />
        </Field>
      </div>

      <Field label="Adresse">
        <input
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Ex. Complexe Sportif El Menzah, Tunis"
          className={INPUT}
        />
      </Field>
    </FormSheet>
  )
}
