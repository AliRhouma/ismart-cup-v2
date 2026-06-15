import { useMemo, type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  Check,
  ChevronRight,
  ClipboardList,
  Inbox,
  SlidersHorizontal,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"
import Avatar from "@/components/kit/Avatar"
import Badge, { type BadgeVariant } from "@/components/kit/Badge"
import EmptyState from "@/components/kit/EmptyState"
import { cn } from "@/lib/utils"
import type { RegistrationStatus, Registration, TournamentStatus } from "@/data/types"
import { useTournaments } from "@/stores/useTournaments"
import { useTeams } from "@/stores/useTeams"
import { usePlayers } from "@/stores/usePlayers"
import { useMatches } from "@/stores/useMatches"
import { usePhases } from "@/stores/usePhases"
import { useRegistrations } from "@/stores/useRegistrations"

/* ─── helpers ───────────────────────────────────────────────────────────── */

const fmtShort = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : ""

// Captured once at module load (the session "now") so the render stays pure —
// "jours avant le début" is relative to when the dashboard was opened.
const NOW_MS = Date.now()

const STATUS_BADGE: Record<TournamentStatus, { label: string; variant: BadgeVariant; dot?: boolean }> = {
  upcoming: { label: "À venir", variant: "brand" },
  active: { label: "En cours", variant: "success", dot: true },
  finished: { label: "Terminé", variant: "neutral" },
}

const REG_BADGE: Record<RegistrationStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: "En attente", variant: "warning" },
  APPROVED: { label: "Acceptée", variant: "success" },
  REJECTED: { label: "Refusée", variant: "danger" },
}

/* ─── action card ───────────────────────────────────────────────────────── */

function ActionCard({
  icon: Icon,
  title,
  description,
  to,
  cta,
}: {
  icon: LucideIcon
  title: string
  description: string
  to: string
  cta: string
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-5" />
        </span>
        <h3 className="font-semibold text-ink">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-ink-muted">{description}</p>
      <Link
        to={to}
        className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-brand-200 px-4 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
      >
        <Icon className="size-4" /> {cta} <ChevronRight className="size-4" />
      </Link>
    </div>
  )
}

/* ─── KPI card ──────────────────────────────────────────────────────────── */

function Kpi({
  label,
  value,
  unit,
  caption,
  bar,
}: {
  label: string
  value: ReactNode
  unit?: string
  caption?: string
  bar?: number
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-sm text-ink-muted">{label}</p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-ink">{value}</span>
        {unit && <span className="text-sm text-ink-muted">{unit}</span>}
      </div>
      {bar != null ? (
        <div className="mt-3 h-2 w-full rounded-full bg-neutral-200">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${bar}%` }} />
        </div>
      ) : (
        caption && <p className="mt-[1.375rem] text-xs text-ink-muted">{caption}</p>
      )}
      {bar != null && caption && <p className="mt-2 text-xs text-ink-muted">{caption}</p>}
    </div>
  )
}

/* ─── table panel ───────────────────────────────────────────────────────── */

function Panel({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: LucideIcon
  title: string
  badge?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-4.5" />
        </span>
        <h2 className="font-semibold text-ink">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  )
}

/* ─── page ──────────────────────────────────────────────────────────────── */

export default function TableauDeBord() {
  const { id = "" } = useParams()

  const tournament = useTournaments((s) => s.tournaments).find((t) => t.id === id)
  const allTeams = useTeams((s) => s.teams)
  const addTeam = useTeams((s) => s.addTeam)
  const allPlayers = usePlayers((s) => s.players)
  const allMatches = useMatches((s) => s.matches)
  const allPhases = usePhases((s) => s.phases)
  const allRegistrations = useRegistrations((s) => s.registrations)
  const updateRegistration = useRegistrations((s) => s.updateRegistration)

  const teams = useMemo(() => allTeams.filter((t) => t.tournamentId === id), [allTeams, id])
  const matches = useMemo(() => allMatches.filter((m) => m.tournamentId === id), [allMatches, id])
  const phases = useMemo(
    () => allPhases.filter((p) => p.tournamentId === id).sort((a, b) => a.order - b.order),
    [allPhases, id],
  )
  const registrations = useMemo(
    () => allRegistrations.filter((r) => r.tournamentId === id),
    [allRegistrations, id],
  )
  const playerCountByTeam = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of allPlayers) map.set(p.teamId, (map.get(p.teamId) ?? 0) + 1)
    return map
  }, [allPlayers])

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
  const status = STATUS_BADGE[tournament.status]
  const registered = teams.length
  const capacity = tournament.numberOfTeams ?? registered
  const fillPct = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0
  const remaining = Math.max(0, capacity - registered)
  const maxPlayers = tournament.numberOfPlayersPerTeam

  // Days before kick-off (computed live, clamped at 0).
  const startMs = new Date(tournament.startDate).getTime()
  const rawDays = Math.ceil((startMs - NOW_MS) / 86_400_000)
  const daysBefore = Math.max(0, rawDays)
  const daysCaption =
    tournament.status === "finished"
      ? "Tournoi terminé"
      : daysBefore === 0
        ? tournament.status === "active"
          ? "Tournoi en cours"
          : "Démarre aujourd'hui"
        : `Début le ${fmtShort(tournament.startDate)}`

  const currentPhase = phases.find((p) => p.status === "current")
  const allDone = phases.length > 0 && phases.every((p) => p.status === "done")
  const phaseCaption =
    phases.length === 0
      ? "Aucune phase"
      : currentPhase
        ? `Étape ${currentPhase.order} sur ${phases.length}`
        : allDone
          ? "Toutes terminées"
          : `${phases.length} phases`

  const completedMatches = matches.filter((m) => m.status === "COMPLETED").length
  const pending = registrations.filter((r) => r.status === "PENDING")

  function approve(reg: Registration) {
    addTeam({ tournamentId: id, name: reg.clubName, category: "Poule A", favorite: false })
    updateRegistration(reg.id, { status: "APPROVED" })
    toast.success(`« ${reg.clubName} » acceptée et ajoutée aux équipes.`)
  }

  function reject(reg: Registration) {
    updateRegistration(reg.id, { status: "REJECTED" })
    toast(`« ${reg.clubName} » refusée.`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Tableau de bord</h1>
          <Badge variant={status.variant} dot={status.dot}>
            {status.label}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          Suivez les inscriptions, la configuration et les indicateurs clés de votre tournoi.
        </p>
      </div>

      {/* Action cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActionCard
          icon={SlidersHorizontal}
          title="Configurer les contraintes"
          description="Définissez la durée des matchs, l'attribution des terrains et les préférences de planification pour optimiser votre tournoi."
          to={`${base}/parametres`}
          cta="Configurer maintenant"
        />
        <ActionCard
          icon={ClipboardList}
          title="Créer un formulaire d'inscription"
          description="Créez un formulaire personnalisé pour permettre aux équipes de s'inscrire directement à votre tournoi."
          to={`${base}/equipes`}
          cta="Configurer maintenant"
        />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Équipes inscrites"
          value={registered}
          unit={`/ ${capacity}`}
          bar={fillPct}
          caption={remaining > 0 ? `${remaining} place${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}` : "Complet"}
        />
        <Kpi label="Jours avant le début" value={daysBefore} caption={daysCaption} />
        <Kpi
          label="Phase actuelle"
          value={<span className="text-xl">{currentPhase?.name ?? (allDone ? "Terminé" : "—")}</span>}
          caption={phaseCaption}
        />
        <Kpi
          label="Nombre total de matchs"
          value={matches.length}
          caption={completedMatches > 0 ? `${completedMatches} terminé${completedMatches > 1 ? "s" : ""}` : "Aucun joué"}
        />
      </div>

      {/* Table panels */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* Équipes inscrites */}
        <Panel icon={Users} title="Équipes inscrites" badge={<Badge variant="neutral">{registered}</Badge>}>
          {teams.length === 0 ? (
            <EmptyState icon={Users} message="Aucune équipe inscrite pour le moment." />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-muted">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3">Club</th>
                  <th className="px-5 py-3 text-right">Joueurs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {teams.map((t) => {
                  const count = playerCountByTeam.get(t.id) ?? 0
                  return (
                    <tr key={t.id} className="transition hover:bg-neutral-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={t.name} size="sm" />
                          <span className="font-medium text-ink">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        <span className={cn("font-semibold", count > 0 ? "text-ink" : "text-ink-muted")}>{count}</span>
                        {maxPlayers != null && <span className="text-ink-muted"> / {maxPlayers}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Panel>

        {/* Demande du club */}
        <Panel
          icon={UserPlus}
          title="Demande du club"
          badge={pending.length > 0 ? <Badge variant="warning">{pending.length} en attente</Badge> : undefined}
        >
          {registrations.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Aucune demande d'inscription"
              message="Les demandes des clubs souhaitant rejoindre le tournoi apparaîtront ici."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted">
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
                    <th className="px-5 py-3">Club</th>
                    <th className="px-5 py-3">Responsable</th>
                    <th className="px-5 py-3 text-right">Joueurs</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {registrations.map((r) => {
                    const badge = REG_BADGE[r.status]
                    return (
                      <tr key={r.id} className="transition hover:bg-neutral-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={r.clubName} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink">{r.clubName}</p>
                              <p className="text-xs text-ink-muted">{fmtShort(r.date)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-ink-subtle">{r.responsibleName}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-ink">{r.playersCount}</td>
                        <td className="px-5 py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          {r.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => approve(r)}
                                aria-label={`Accepter ${r.clubName}`}
                                className="grid size-9 place-items-center rounded-lg text-success-600 transition hover:bg-success-50"
                              >
                                <Check className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => reject(r)}
                                aria-label={`Refuser ${r.clubName}`}
                                className="grid size-9 place-items-center rounded-lg text-danger-500 transition hover:bg-danger-50"
                              >
                                <X className="size-4" />
                              </button>
                            </div>
                          ) : (
                            <p className="text-right text-ink-muted">—</p>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
