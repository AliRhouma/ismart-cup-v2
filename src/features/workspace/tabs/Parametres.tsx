import { useMemo, useState, type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  CalendarDays,
  Check,
  ChevronRight,
  Inbox,
  MapPin,
  SlidersHorizontal,
  Target,
  Timer,
  UserCheck,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"
import Badge from "@/components/kit/Badge"
import EmptyState from "@/components/kit/EmptyState"
import { cn } from "@/lib/utils"
import type { Tournament } from "@/data/types"
import { useTournaments } from "@/stores/useTournaments"
import { useStadiums } from "@/stores/useStadiums"
import { useReferees } from "@/stores/useReferees"

/* ─── form state ────────────────────────────────────────────────────────── */

interface FormState {
  startTime: string
  endTime: string
  pauseBetweenMatches: string
  hasMiddayBreak: boolean
  middayBreakStart: string
  middayBreakEnd: string
  numberOfPeriods: string
  periodDuration: string
  pointsForWin: string
  pointsForDraw: string
  pointsForLoss: string
  forfeitScore: string
}

const numStr = (n?: number) => (n == null ? "" : String(n))
const toNum = (s: string) => (s.trim() === "" ? undefined : Number(s))

function toForm(t?: Tournament): FormState {
  return {
    startTime: t?.startTime ?? "",
    endTime: t?.endTime ?? "",
    pauseBetweenMatches: numStr(t?.pauseBetweenMatches),
    hasMiddayBreak: t?.hasMiddayBreak ?? false,
    middayBreakStart: t?.middayBreakStart ?? "",
    middayBreakEnd: t?.middayBreakEnd ?? "",
    numberOfPeriods: numStr(t?.numberOfPeriods),
    periodDuration: numStr(t?.periodDuration),
    pointsForWin: numStr(t?.pointsForWin),
    pointsForDraw: numStr(t?.pointsForDraw),
    pointsForLoss: numStr(t?.pointsForLoss),
    forfeitScore: numStr(t?.forfeitScore),
  }
}

const fmtShort = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : ""

function durationDays(start?: string, end?: string): number | null {
  if (!start || !end) return null
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (Number.isNaN(ms)) return null
  return Math.max(1, Math.round(ms / 86_400_000) + 1)
}

/* ─── building blocks ───────────────────────────────────────────────────── */

const INPUT =
  "h-11 w-full rounded-lg border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50"

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-subtle">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-muted">{hint}</span>}
    </label>
  )
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-surface p-6 shadow-sm", className)}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold text-ink">{title}</h2>
          <p className="text-sm text-ink-muted">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function DerivedCard({
  icon: Icon,
  label,
  value,
  hint,
  to,
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
  hint: string
  to?: string
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-4.5" />
        </span>
        <Badge variant="neutral">Calculé</Badge>
      </div>
      <p className="mt-3 text-sm text-ink-muted">{label}</p>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="text-2xl font-bold text-ink">{value}</span>
        {to && (
          <ChevronRight className="size-4 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
        )}
      </div>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </>
  )

  const cls = "rounded-xl border border-border bg-surface p-5 shadow-sm"
  return to ? (
    <Link to={to} className={cn(cls, "group transition hover:border-brand-200")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-brand-500" : "bg-neutral-300")}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  )
}

/* ─── page ──────────────────────────────────────────────────────────────── */

export default function Parametres() {
  const { id = "" } = useParams()
  const tournament = useTournaments((s) => s.tournaments).find((t) => t.id === id)
  const updateTournament = useTournaments((s) => s.updateTournament)
  const allStadiums = useStadiums((s) => s.stadiums)
  const allReferees = useReferees((s) => s.referees)

  const [form, setForm] = useState<FormState>(() => toForm(tournament))

  const terrains = useMemo(() => allStadiums.filter((s) => s.tournamentId === id).length, [allStadiums, id])
  const arbitres = useMemo(() => allReferees.filter((r) => r.tournamentId === id).length, [allReferees, id])

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(toForm(tournament)),
    [form, tournament],
  )

  if (!tournament) {
    return (
      <EmptyState
        icon={Inbox}
        title="Tournoi introuvable"
        message="Ce tournoi n'existe pas ou a été supprimé."
        action={
          <Link
            to="/tournaments"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700"
          >
            Retour aux tournois
          </Link>
        }
      />
    )
  }

  const base = `/tournaments/${id}`
  const days = durationDays(tournament.startDate, tournament.endDate)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const periods = Number(form.numberOfPeriods) || 0
  const periodDur = Number(form.periodDuration) || 0
  const totalPlay = periods * periodDur

  function handleSave() {
    if (toNum(form.numberOfPeriods) != null && Number(form.numberOfPeriods) < 1) {
      toast.error("Le nombre de périodes doit être au moins de 1.")
      return
    }
    updateTournament(id, {
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      pauseBetweenMatches: toNum(form.pauseBetweenMatches),
      hasMiddayBreak: form.hasMiddayBreak,
      middayBreakStart: form.middayBreakStart || undefined,
      middayBreakEnd: form.middayBreakEnd || undefined,
      numberOfPeriods: toNum(form.numberOfPeriods),
      periodDuration: toNum(form.periodDuration),
      pointsForWin: toNum(form.pointsForWin),
      pointsForDraw: toNum(form.pointsForDraw),
      pointsForLoss: toNum(form.pointsForLoss),
      forfeitScore: toNum(form.forfeitScore),
    })
    toast.success("Contraintes enregistrées.")
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Contraintes globales</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Configurez la planification, le format des matchs et les règles de points de votre tournoi.
        </p>
      </div>

      {/* Derived summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DerivedCard
          icon={MapPin}
          label="Terrains disponibles"
          value={terrains}
          hint="Gérés dans Calendrier"
          to={`${base}/calendrier`}
        />
        <DerivedCard
          icon={UserCheck}
          label="Arbitres disponibles"
          value={arbitres}
          hint="Gérés dans Arbitres"
          to={`${base}/arbitres`}
        />
        <DerivedCard
          icon={CalendarDays}
          label="Durée du tournoi"
          value={days ? `${days} jours` : "—"}
          hint={`${fmtShort(tournament.startDate)} → ${fmtShort(tournament.endDate)}`}
        />
      </div>

      {/* Planification */}
      <SectionCard
        icon={SlidersHorizontal}
        title="Planification"
        subtitle="Définissez les créneaux horaires et la marge entre les rencontres."
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <Field label="Heure de début">
            <input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className={INPUT} />
          </Field>
          <Field label="Heure de fin">
            <input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className={INPUT} />
          </Field>
          <Field label="Pause entre les matchs" hint="En minutes, sur un même terrain.">
            <input
              type="number"
              min={0}
              value={form.pauseBetweenMatches}
              onChange={(e) => set("pauseBetweenMatches", e.target.value)}
              placeholder="15"
              className={INPUT}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Pause de midi + Format des matchs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          icon={UtensilsCrossed}
          title="Pause de midi"
          subtitle="Créneau déjeuner optionnel sans matchs programmés."
        >
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-subtle px-4 py-3">
            <span className="text-sm font-medium text-ink">Activer la pause de midi</span>
            <Toggle checked={form.hasMiddayBreak} onChange={() => set("hasMiddayBreak", !form.hasMiddayBreak)} />
          </div>

          {form.hasMiddayBreak ? (
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="Début de la pause">
                <input
                  type="time"
                  value={form.middayBreakStart}
                  onChange={(e) => set("middayBreakStart", e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Fin de la pause">
                <input
                  type="time"
                  value={form.middayBreakEnd}
                  onChange={(e) => set("middayBreakEnd", e.target.value)}
                  className={INPUT}
                />
              </Field>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">Désactivée — aucune pause programmée.</p>
          )}
        </SectionCard>

        <SectionCard
          icon={Timer}
          title="Format des matchs"
          subtitle="Durée et structure des périodes de chaque match."
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="Nombre de périodes">
              <input
                type="number"
                min={1}
                value={form.numberOfPeriods}
                onChange={(e) => set("numberOfPeriods", e.target.value)}
                placeholder="2"
                className={INPUT}
              />
            </Field>
            <Field label="Durée d'une période" hint="En minutes.">
              <input
                type="number"
                min={0}
                value={form.periodDuration}
                onChange={(e) => set("periodDuration", e.target.value)}
                placeholder="45"
                className={INPUT}
              />
            </Field>
          </div>
          {totalPlay > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
              <Timer className="size-4 shrink-0" />
              Durée totale de jeu : <span className="font-semibold">{totalPlay} min</span>
              <span className="text-brand-600/70">
                ({periods} × {periodDur} min)
              </span>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Règles de points */}
      <SectionCard
        icon={Target}
        title="Règles de points"
        subtitle="Points attribués selon le résultat, et score appliqué en cas de forfait."
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          <Field label="Victoire">
            <input type="number" min={0} value={form.pointsForWin} onChange={(e) => set("pointsForWin", e.target.value)} placeholder="3" className={INPUT} />
          </Field>
          <Field label="Match nul">
            <input type="number" min={0} value={form.pointsForDraw} onChange={(e) => set("pointsForDraw", e.target.value)} placeholder="1" className={INPUT} />
          </Field>
          <Field label="Défaite">
            <input type="number" min={0} value={form.pointsForLoss} onChange={(e) => set("pointsForLoss", e.target.value)} placeholder="0" className={INPUT} />
          </Field>
          <Field label="Score de forfait" hint="Buts accordés à l'équipe présente.">
            <input type="number" min={0} value={form.forfeitScore} onChange={(e) => set("forfeitScore", e.target.value)} placeholder="3" className={INPUT} />
          </Field>
        </div>
        <p className="mt-4 text-sm text-ink-subtle">
          Aperçu :{" "}
          <span className="font-medium text-ink">Victoire {form.pointsForWin || "—"} pt</span> ·{" "}
          <span className="font-medium text-ink">Nul {form.pointsForDraw || "—"} pt</span> ·{" "}
          <span className="font-medium text-ink">Défaite {form.pointsForLoss || "—"} pt</span> ·{" "}
          <span className="font-medium text-ink">Forfait {form.forfeitScore || "—"}–0</span>
        </p>
      </SectionCard>

      {/* Dirty-aware action bar */}
      {dirty && (
        <div className="sticky bottom-0 z-10 -mx-6 flex items-center gap-3 border-t border-border bg-surface/90 px-6 py-4 backdrop-blur">
          <span className="mr-auto inline-flex items-center gap-2 text-sm text-ink-muted">
            <span className="size-1.5 rounded-full bg-warning-500" />
            Modifications non enregistrées
          </span>
          <button
            type="button"
            onClick={() => setForm(toForm(tournament))}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 font-medium text-ink-subtle transition hover:bg-neutral-100"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Check className="size-4" /> Confirmer
          </button>
        </div>
      )}
    </div>
  )
}
