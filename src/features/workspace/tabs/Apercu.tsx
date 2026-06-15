import { useMemo, type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import {
  AlarmClock,
  Award,
  BarChart3,
  Calendar,
  Check,
  ChevronRight,
  CircleDot,
  Clock,
  Inbox,
  Layers,
  MapPin,
  Medal,
  Megaphone,
  Settings,
  Star,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react"
import Avatar from "@/components/kit/Avatar"
import Badge from "@/components/kit/Badge"
import EmptyState from "@/components/kit/EmptyState"
import { cn } from "@/lib/utils"
import type {
  Match,
  Phase,
  Reward,
  SurfaceType,
  Team,
} from "@/data/types"
import { useTournaments } from "@/stores/useTournaments"
import { useTeams } from "@/stores/useTeams"
import { usePlayers } from "@/stores/usePlayers"
import { useStadiums } from "@/stores/useStadiums"
import { useMatches } from "@/stores/useMatches"
import { usePhases } from "@/stores/usePhases"
import { useAnnouncements } from "@/stores/useAnnouncements"
import { useRewards } from "@/stores/useRewards"

/* ─── small display helpers ─────────────────────────────────────────────── */

const fmtLong = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""
const fmtShort = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : ""

function durationDays(start?: string, end?: string): number | null {
  if (!start || !end) return null
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (Number.isNaN(ms)) return null
  return Math.max(1, Math.round(ms / 86_400_000) + 1)
}

const SURFACE_LABEL: Record<SurfaceType, string> = {
  NATURAL: "Pelouse naturelle",
  SYNTHETIC: "Terrain synthétique",
  MIXED: "Surface mixte",
}

const REWARD_ICON: Record<Reward["kind"], LucideIcon> = {
  trophy: Trophy,
  medal: Medal,
  individual: Award,
}

const MATCH_BADGE: Record<Match["status"], { label: string; variant: "neutral" | "brand" | "success" | "warning" | "danger"; dot?: boolean }> = {
  COMPLETED: { label: "Terminé", variant: "neutral" },
  SCHEDULED: { label: "À venir", variant: "brand" },
  IN_PROGRESS: { label: "En direct", variant: "success", dot: true },
  FORFEIT: { label: "Forfait", variant: "warning" },
  CANCELLED: { label: "Annulé", variant: "danger" },
}

/* ─── reusable section card ─────────────────────────────────────────────── */

function Section({
  icon: Icon,
  title,
  badge,
  tint = "brand",
  action,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  badge?: ReactNode
  tint?: "brand" | "accent"
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-surface p-5 shadow-sm", className)}>
      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg",
            tint === "accent" ? "bg-accent2-100 text-accent2-600" : "bg-brand-50 text-brand-600",
          )}
        >
          <Icon className="size-5" />
        </span>
        <h2 className="font-semibold text-ink">{title}</h2>
        {badge}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  )
}

/* ─── result match card ─────────────────────────────────────────────────── */

interface Side {
  label: string
  placeholder: boolean
  score: ReactNode
  winner: boolean
}

function MatchCard({
  match,
  teamById,
  stadiumName,
}: {
  match: Match
  teamById: Map<string, Team>
  stadiumName?: string
}) {
  const played = match.status === "COMPLETED" || match.status === "FORFEIT"

  const side = (teamId?: string, placeholder?: string, score?: number, other?: number): Side => {
    const team = teamId ? teamById.get(teamId) : undefined
    return {
      label: team?.name ?? placeholder ?? "À définir",
      placeholder: !team,
      score: played && score != null ? score : "–",
      winner: played && score != null && other != null && score > other,
    }
  }

  const s1 = side(match.team1Id, match.team1Placeholder, match.score1, match.score2)
  const s2 = side(match.team2Id, match.team2Placeholder, match.score2, match.score1)
  const badge = MATCH_BADGE[match.status]
  const meta = [match.group, match.roundNumber && `Tour ${match.roundNumber}`].filter(Boolean).join(" · ")
  const footer = [fmtShort(match.date), match.startTime, stadiumName].filter(Boolean).join(" · ")

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-ink-muted">{meta || "Match"}</span>
        <Badge variant={badge.variant} dot={badge.dot}>
          {badge.label}
        </Badge>
      </div>

      <div className="space-y-1.5">
        {[s1, s2].map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {s.placeholder ? (
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-neutral-100 text-xs font-semibold text-ink-muted">
                  ?
                </span>
              ) : (
                <Avatar name={s.label} size="sm" />
              )}
              <span className={cn("truncate text-sm", s.winner ? "font-semibold text-ink" : "text-ink-subtle")}>
                {s.label}
              </span>
            </div>
            <span className={cn("tabular-nums text-sm", s.winner ? "font-bold text-ink" : "text-ink-muted")}>
              {s.score}
            </span>
          </div>
        ))}
      </div>

      {footer && <p className="mt-2 border-t border-border pt-2 text-xs text-ink-muted">{footer}</p>}
    </div>
  )
}

/* ─── progression stepper ───────────────────────────────────────────────── */

function ProgressionStepper({ phases }: { phases: Phase[] }) {
  return (
    <ol className="flex items-center">
      {phases.map((p, i) => {
        const done = p.status === "done"
        const current = p.status === "current"
        return (
          <li key={p.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-full text-sm font-semibold transition",
                  done && "bg-brand-500 text-brand-foreground ring-4 ring-brand-100",
                  current && "border-2 border-brand-500 bg-surface text-brand-600 ring-4 ring-brand-100",
                  !done && !current && "bg-neutral-100 text-ink-muted",
                )}
              >
                {done ? <Check className="size-5" /> : p.order}
              </span>
              <span
                className={cn(
                  "mt-2 max-w-[7.5rem] text-center text-xs leading-tight",
                  current ? "font-medium text-brand-600" : done ? "text-ink-subtle" : "text-ink-muted",
                )}
              >
                {p.name}
              </span>
            </div>
            {i < phases.length - 1 && (
              <span className={cn("mx-2 h-0.5 flex-1 self-start rounded-full", done ? "bg-brand-500" : "bg-neutral-200")} style={{ marginTop: "1.25rem" }} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* ─── page ──────────────────────────────────────────────────────────────── */

export default function Apercu() {
  const { id = "" } = useParams()

  const tournament = useTournaments((s) => s.tournaments).find((t) => t.id === id)
  const allTeams = useTeams((s) => s.teams)
  const allPlayers = usePlayers((s) => s.players)
  const allStadiums = useStadiums((s) => s.stadiums)
  const allMatches = useMatches((s) => s.matches)
  const allPhases = usePhases((s) => s.phases)
  const allAnnouncements = useAnnouncements((s) => s.announcements)
  const allRewards = useRewards((s) => s.rewards)

  const teams = useMemo(() => allTeams.filter((t) => t.tournamentId === id), [allTeams, id])
  const stadiums = useMemo(() => allStadiums.filter((s) => s.tournamentId === id), [allStadiums, id])
  const matches = useMemo(() => allMatches.filter((m) => m.tournamentId === id), [allMatches, id])
  const phases = useMemo(
    () => allPhases.filter((p) => p.tournamentId === id).sort((a, b) => a.order - b.order),
    [allPhases, id],
  )
  const announcements = useMemo(
    () =>
      allAnnouncements
        .filter((a) => a.tournamentId === id)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [allAnnouncements, id],
  )
  const rewards = useMemo(() => allRewards.filter((r) => r.tournamentId === id), [allRewards, id])

  // Derived lookups
  const teamById = useMemo(() => new Map(allTeams.map((t) => [t.id, t])), [allTeams])
  const stadiumById = useMemo(() => new Map(allStadiums.map((s) => [s.id, s])), [allStadiums])
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
  const registered = teams.length
  const capacity = tournament.numberOfTeams ?? registered
  const fillPct = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0
  const remaining = Math.max(0, capacity - registered)
  const maxPlayers = tournament.numberOfPlayersPerTeam
  const totalPlayers = teams.reduce((sum, t) => sum + (playerCountByTeam.get(t.id) ?? 0), 0)
  const duration = durationDays(tournament.startDate, tournament.endDate)
  const currentPhase = phases.find((p) => p.status === "current")
  const allDone = phases.length > 0 && phases.every((p) => p.status === "done")

  const dateRange = tournament.endDate
    ? `${fmtShort(tournament.startDate)} – ${fmtLong(tournament.endDate)}`
    : fmtLong(tournament.startDate)

  // Context strip items (only those that exist)
  const context: { icon: LucideIcon; text: string }[] = [
    { icon: Calendar, text: dateRange },
    ...(duration ? [{ icon: Clock, text: `${duration} jour${duration > 1 ? "s" : ""}` }] : []),
    ...(tournament.sport ? [{ icon: CircleDot, text: tournament.sport }] : []),
    ...(tournament.address ? [{ icon: MapPin, text: tournament.address }] : []),
    ...(tournament.surfaceType ? [{ icon: Layers, text: SURFACE_LABEL[tournament.surfaceType] }] : []),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Aperçu</h1>
          <p className="mt-1 text-sm text-ink-muted">Vue d'ensemble et état du tournoi en un coup d'œil.</p>
        </div>
        <Link
          to={`${base}/parametres`}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-brand-300 bg-surface px-4 font-medium text-brand-700 transition hover:bg-brand-50"
        >
          <Settings className="size-4" /> Paramètres
        </Link>
      </div>

      {/* Context strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-subtle">
        {context.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            <c.icon className="size-4 text-ink-muted" />
            {c.text}
          </span>
        ))}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-ink-muted">Équipes inscrites</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-ink">{registered}</span>
            <span className="text-sm text-ink-muted">/ {capacity}</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-neutral-200">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${fillPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            {remaining > 0 ? `${remaining} place${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}` : "Complet"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-ink-muted">Joueurs / équipe</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-ink">{maxPlayers ?? "—"}</span>
            <span className="text-sm text-ink-muted">max</span>
          </div>
          <p className="mt-[1.375rem] text-xs text-ink-muted">{totalPlayers} joueurs inscrits au total</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-ink-muted">Terrains</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-ink">{stadiums.length}</span>
            <span className="text-sm text-ink-muted">disponibles</span>
          </div>
          <p className="mt-[1.375rem] text-xs text-ink-muted">
            {tournament.surfaceType ? SURFACE_LABEL[tournament.surfaceType] : "—"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-ink-muted">Phase courante</p>
          <div className="mt-2">
            <span className="text-xl font-bold text-ink">
              {currentPhase?.name ?? (allDone ? "Tournoi terminé" : (phases[0]?.name ?? "—"))}
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            {phases.length > 0
              ? currentPhase
                ? `Étape ${currentPhase.order} sur ${phases.length}`
                : `${phases.length} phase${phases.length > 1 ? "s" : ""}`
              : "Aucune phase"}
          </p>
        </div>
      </div>

      {/* Progression */}
      <Section icon={BarChart3} title="Indicateur de progression">
        {phases.length > 0 ? (
          <div className="px-2 pt-2">
            <ProgressionStepper phases={phases} />
          </div>
        ) : (
          <EmptyState icon={BarChart3} message="Les phases du tournoi n'ont pas encore été configurées." />
        )}
      </Section>

      {/* Body: primary (left) + reference (right) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — results + teams */}
        <div className="space-y-6 lg:col-span-2">
          {/* Résultats grouped by phase */}
          <Section icon={BarChart3} title="Résultats">
            {matches.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="Aucun match"
                message="Les rencontres apparaîtront ici une fois le calendrier généré."
              />
            ) : (
              <div className="space-y-5">
                {phases
                  .map((phase) => ({ phase, ms: matches.filter((m) => m.phaseName === phase.name) }))
                  .filter(({ ms }) => ms.length > 0)
                  .map(({ phase, ms }) => (
                    <div key={phase.id}>
                      <div className="mb-2.5 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-ink">{phase.name}</h3>
                        <Link
                          to={`${base}/resultats`}
                          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 transition hover:text-brand-700"
                        >
                          Classements <ChevronRight className="size-4" />
                        </Link>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {ms.map((m) => (
                          <MatchCard
                            key={m.id}
                            match={m}
                            teamById={teamById}
                            stadiumName={m.stadiumId ? stadiumById.get(m.stadiumId)?.name : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Section>

          {/* Équipes inscrites */}
          <Section
            icon={Users}
            title="Équipes inscrites"
            badge={<Badge variant="neutral">{registered}</Badge>}
            action={
              <Link
                to={`${base}/equipes`}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition hover:text-brand-700"
              >
                Voir tout <ChevronRight className="size-4" />
              </Link>
            }
          >
            {teams.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Aucune équipe inscrite"
                message="Ajoutez des équipes depuis l'onglet Équipes pour démarrer."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {teams.map((t) => {
                  const count = playerCountByTeam.get(t.id) ?? 0
                  const pct = maxPlayers ? Math.min(100, Math.round((count / maxPlayers) * 100)) : 0
                  return (
                    <Link
                      key={t.id}
                      to={`${base}/equipes`}
                      className="group flex items-center gap-3 rounded-lg border border-border p-3 transition hover:border-brand-200 hover:bg-brand-50/50"
                    >
                      <Avatar name={t.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-medium text-ink">{t.name}</span>
                          {t.favorite && <Star className="size-3.5 shrink-0 fill-current text-accent2-500" />}
                        </div>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {count > 0
                            ? `${count} joueur${count > 1 ? "s" : ""}${maxPlayers ? ` / ${maxPlayers}` : ""}`
                            : "Aucun joueur"}
                        </p>
                        {maxPlayers != null && (
                          <div className="mt-1.5 h-1 w-full rounded-full bg-neutral-200">
                            <div className="h-full rounded-full bg-brand-400" style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </div>
                      <Badge variant="brand">{t.category}</Badge>
                    </Link>
                  )
                })}
              </div>
            )}
          </Section>
        </div>

        {/* Right — reference info */}
        <div className="space-y-6">
          {/* Lieu & terrains */}
          <Section icon={MapPin} title="Lieu & terrains">
            <dl className="space-y-2.5 text-sm">
              {tournament.address && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Adresse</dt>
                  <dd className="text-right font-medium text-ink">{tournament.address}</dd>
                </div>
              )}
              {tournament.sport && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Sport</dt>
                  <dd className="text-right font-medium text-ink">{tournament.sport}</dd>
                </div>
              )}
              {tournament.surfaceType && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Surface</dt>
                  <dd className="text-right font-medium text-ink">{SURFACE_LABEL[tournament.surfaceType]}</dd>
                </div>
              )}
            </dl>

            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                Terrains ({stadiums.length})
              </p>
              {stadiums.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stadiums.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1 text-xs text-ink-subtle"
                    >
                      <MapPin className="size-3" /> {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-muted">Aucun terrain défini.</p>
              )}
            </div>
          </Section>

          {/* Prix & récompenses */}
          <Section icon={Trophy} tint="accent" title="Prix & récompenses">
            {rewards.length > 0 ? (
              <ul className="space-y-3.5">
                {rewards.map((r) => {
                  const Icon = REWARD_ICON[r.kind]
                  return (
                    <li key={r.id} className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent2-50 text-accent2-600">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">{r.title}</p>
                        {r.description && <p className="mt-0.5 text-xs text-ink-muted">{r.description}</p>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState icon={Trophy} message="Aucune récompense définie pour ce tournoi." />
            )}
          </Section>

          {/* Actualités */}
          <Section
            icon={Megaphone}
            title="Actualités"
            badge={announcements.length > 0 ? <Badge variant="neutral">{announcements.length}</Badge> : undefined}
          >
            {announcements.length > 0 ? (
              <ul className="space-y-3.5">
                {announcements.map((a) => {
                  const delay = a.type === "DELAY"
                  return (
                    <li key={a.id} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-lg",
                          delay ? "bg-warning-50 text-warning-600" : "bg-brand-50 text-brand-600",
                        )}
                      >
                        {delay ? <AlarmClock className="size-4" /> : <Megaphone className="size-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-ink">{a.name}</p>
                          <span className="shrink-0 text-xs text-ink-muted">{fmtShort(a.date)}</span>
                        </div>
                        {a.description && <p className="mt-0.5 text-xs text-ink-muted">{a.description}</p>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState
                icon={Megaphone}
                title="Aucune annonce"
                message="Les annonces du tournoi apparaîtront ici."
              />
            )}
          </Section>
        </div>
      </div>
    </div>
  )
}
