import type { ReactNode } from "react"
import { CalendarDays, MapPin, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import heroImg from "@/assets/hero.png"
import { formatDateRange, tournament, type PublicStatus, type PublicTeam } from "./mock"

/**
 * Hero — the showcase masthead. Cover image under a brand gradient so white text
 * stays legible, then the essentials: status, name, discipline, dates, location.
 * State-aware: `upcoming` adds a "commence bientôt" note; `completed` crowns the
 * champion in a gold banner directly beneath the cover.
 */

const STATUS_PILL: Record<PublicStatus, { label: string; dot: string; live?: boolean }> = {
  upcoming: { label: "À venir", dot: "bg-brand-300" },
  active: { label: "En cours", dot: "bg-success-500", live: true },
  completed: { label: "Terminé", dot: "bg-accent2-500" },
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
      {children}
    </span>
  )
}

export default function PublicHero({
  status,
  champion,
  runnerUp,
}: {
  status: PublicStatus
  champion: PublicTeam | null
  runnerUp: PublicTeam | null
}) {
  const pill = STATUS_PILL[status]

  return (
    <header>
      <section className="relative isolate overflow-hidden">
        {/* Cover */}
        <img src={heroImg} alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/95 via-brand-900/75 to-brand-700/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-transparent" />

        <div className="relative mx-auto flex max-w-5xl flex-col justify-end px-4 py-10 sm:px-6 sm:py-14 lg:min-h-[20rem] lg:py-20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
              <span className={cn("size-1.5 rounded-full", pill.dot, pill.live && "animate-pulse")} />
              {pill.label}
            </span>
            <Chip>{tournament.edition}</Chip>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {tournament.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Chip>{tournament.sport}</Chip>
            <Chip>{tournament.category}</Chip>
          </div>

          <div className="mt-4 flex flex-col gap-1.5 text-sm text-white/85 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0 text-white/70" />
              {formatDateRange(tournament.startDate, tournament.endDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0 text-white/70" />
              {tournament.venue} · {tournament.city}
            </span>
          </div>

          {status === "upcoming" && (
            <p className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
              🏖️ Le tournoi commence bientôt — restez connectés !
            </p>
          )}
        </div>
      </section>

      {/* Champion banner (completed only) */}
      {status === "completed" && champion && (
        <section className="border-b border-accent2-100 bg-gradient-to-r from-accent2-50 via-accent2-50 to-surface">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-5 sm:px-6 sm:py-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent2-100 text-accent2-600 sm:size-14">
              <Trophy className="size-6 sm:size-7" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent2-700">Champion</p>
              <p className="truncate text-xl font-bold tracking-tight text-ink sm:text-2xl">{champion.name}</p>
              {runnerUp && (
                <p className="mt-0.5 truncate text-sm text-ink-muted">Finaliste · {runnerUp.name}</p>
              )}
            </div>
          </div>
        </section>
      )}
    </header>
  )
}
