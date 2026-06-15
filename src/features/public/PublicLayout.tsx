import { useEffect } from "react"
import { NavLink, Outlet, useOutletContext, useSearchParams } from "react-router-dom"
import { CalendarDays, History, Home, ListOrdered, Trophy, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import PublicHero from "./PublicHero"
import SponsorsBand from "./SponsorsBand"
import { getPublicView, resolveStatus, tournament, type PublicStatus, type PublicView } from "./mock"

/**
 * Shared layout for the public vitrine (/t/:slug): minimal light header, hero,
 * a responsive tab nav, then the active view via <Outlet/>, a sponsors band and
 * footer. The computed view + status are passed to child views through the
 * outlet context. ?state= rides along on every internal link (usePublicLinks).
 */

const TABS: { seg: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { seg: "", label: "Accueil", icon: Home, end: true },
  { seg: "resultats", label: "Résultats", icon: History },
  { seg: "matchs", label: "Matchs", icon: CalendarDays },
  { seg: "classement", label: "Classement", icon: ListOrdered },
]

const STATUS_PILL: Record<PublicStatus, { label: string; cls: string; dot: string }> = {
  upcoming: { label: "À venir", cls: "bg-brand-50 text-brand-700", dot: "bg-brand-500" },
  active: { label: "En cours", cls: "bg-success-50 text-success-700", dot: "bg-success-500" },
  completed: { label: "Terminé", cls: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
}

interface PublicContext {
  status: PublicStatus
  view: PublicView
}
// eslint-disable-next-line react-refresh/only-export-components
export const usePublicData = () => useOutletContext<PublicContext>()

export default function PublicLayout() {
  const [searchParams] = useSearchParams()
  const status = resolveStatus(searchParams.get("state"))
  const view = getPublicView(status)
  const search = searchParams.toString() ? `?${searchParams.toString()}` : ""

  useEffect(() => {
    const prev = document.title
    document.title = `${tournament.name} · iSmart-Cup`
    return () => {
      document.title = prev
    }
  }, [])

  const pill = STATUS_PILL[status]

  return (
    <div className="min-h-screen bg-surface-subtle">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <NavLink to={{ pathname: `/t/${tournament.slug}`, search }} className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-brand-foreground shadow-sm">
              <Trophy className="size-4.5" />
            </span>
            <span className="text-sm font-bold tracking-tight text-ink">
              iSmart<span className="text-brand-600">-Cup</span>
            </span>
          </NavLink>
          <span className={cn("ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", pill.cls)}>
            <span className={cn("size-1.5 rounded-full", pill.dot, status === "active" && "animate-pulse")} />
            {pill.label}
          </span>
        </div>
      </div>

      <PublicHero status={status} champion={view.champion} runnerUp={view.runnerUp} />

      {/* Tab nav — compact stacked buttons on mobile (no scroll), pills on desktop */}
      <nav className="sticky top-14 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto grid max-w-5xl grid-cols-4 gap-1 px-2 sm:flex sm:gap-1 sm:px-6 sm:py-2">
          {TABS.map((t) => (
            <NavLink
              key={t.seg}
              to={{ pathname: t.seg ? `/t/${tournament.slug}/${t.seg}` : `/t/${tournament.slug}`, search }}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-medium transition",
                  "sm:h-10 sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:py-0 sm:text-sm",
                  isActive ? "bg-brand-50 text-brand-600" : "text-ink-muted hover:bg-neutral-100 hover:text-ink",
                )
              }
            >
              <t.icon className="size-5 sm:size-4" />
              <span className="truncate">{t.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-9">
        <Outlet context={{ status, view } satisfies PublicContext} />
      </main>

      <SponsorsBand />

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center sm:px-6">
          <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <Trophy className="size-5" />
          </span>
          <p className="text-sm font-semibold text-ink">{tournament.name}</p>
          <p className="text-xs text-ink-muted">
            Propulsé par <span className="font-medium text-ink-subtle">iSmart-Cup</span> · Suivi spectateur en direct
          </p>
          <p className="mt-1 text-xs text-ink-muted">© 2026 iSmart-Cup — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  )
}
