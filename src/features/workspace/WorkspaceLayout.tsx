import { Link, NavLink, Outlet, useParams } from "react-router-dom"
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Handshake,
  LayoutDashboard,
  LayoutGrid,
  Moon,
  Settings,
  Shuffle,
  Star,
  Sun,
  Trophy,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/app/providers"

interface WorkspaceTab {
  id: string
  label: string
  /** Child path segment under /tournaments/:id ("" for the index tab). */
  to: string
  icon: LucideIcon
  index?: boolean
}

// Single source of truth: WorkspaceLayout renders these, router.tsx mounts them.
// eslint-disable-next-line react-refresh/only-export-components
export const WORKSPACE_TABS: WorkspaceTab[] = [
  { id: "apercu", label: "Aperçu", to: "", icon: LayoutGrid, index: true },
  { id: "dashboard", label: "Tableau de bord", to: "tableau-de-bord", icon: LayoutDashboard },
  { id: "parametres", label: "Paramètres", to: "parametres", icon: Settings },
  { id: "sponsors", label: "Sponsors", to: "sponsors", icon: Handshake },
  { id: "equipes", label: "Équipes", to: "equipes", icon: Users },
  { id: "tirage", label: "Tirage", to: "tirage", icon: Shuffle },
  { id: "calendrier", label: "Calendrier", to: "calendrier", icon: CalendarDays },
  { id: "resultats", label: "Résultats", to: "resultats", icon: BarChart3 },
  { id: "arbitres", label: "Arbitres", to: "arbitres", icon: UserCheck },
  { id: "recompenses", label: "Récompenses", to: "recompenses", icon: Trophy },
  { id: "favoris", label: "Mes favoris", to: "favoris", icon: Star },
]

export default function WorkspaceLayout() {
  const { id } = useParams()
  const { theme, toggleTheme } = useTheme()
  const base = `/tournaments/${id}`

  return (
    <div className="min-h-screen bg-surface-subtle">
      <header className="border-b border-border bg-surface px-6 pt-4">
        <div className="flex items-center gap-3">
          <Link
            to="/tournaments"
            aria-label="Retour aux tournois"
            className="grid size-9 place-items-center rounded-lg text-ink-muted transition hover:bg-neutral-100 hover:text-ink"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Espace tournoi</h1>
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
            {id}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Basculer le thème clair / sombre"
              className="grid size-9 place-items-center rounded-lg text-ink-muted transition hover:bg-neutral-100 hover:text-ink"
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
          </div>
        </div>

        <nav className="mt-4 flex items-center gap-1 overflow-x-auto pb-px">
          {WORKSPACE_TABS.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.index ? base : `${base}/${tab.to}`}
              end={tab.index}
              className={({ isActive }) =>
                cn(
                  "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition",
                  isActive
                    ? "bg-brand-50 text-brand-600"
                    : "text-ink-muted hover:bg-neutral-100 hover:text-ink",
                )
              }
            >
              <tab.icon className="size-4" /> {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
