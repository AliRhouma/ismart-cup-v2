import { useEffect, useRef, useState } from "react"
import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Handshake,
  LayoutDashboard,
  LayoutGrid,
  Moon,
  MoreVertical,
  Pencil,
  Settings,
  Shuffle,
  Star,
  Sun,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/app/providers"
import { useTournaments } from "@/stores/useTournaments"
import ConfirmDialog from "@/components/kit/ConfirmDialog"
import TournamentInfoSheet from "@/features/workspace/TournamentInfoSheet"
import type { TournamentStatus } from "@/data/types"

const STATUS_BADGE: Record<TournamentStatus, { label: string; cls: string }> = {
  upcoming: { label: "À venir", cls: "bg-brand-50 text-brand-700" },
  active: { label: "En cours", cls: "bg-success-50 text-success-700" },
  finished: { label: "Terminé", cls: "bg-neutral-100 text-neutral-600" },
}

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
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const tournament = useTournaments((s) => s.tournaments).find((t) => t.id === id)
  const removeTournament = useTournaments((s) => s.removeTournament)
  const base = `/tournaments/${id}`
  const status = tournament ? STATUS_BADGE[tournament.status] : null

  const [menuOpen, setMenuOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the ⋮ menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  function handleDelete() {
    if (!tournament) return
    removeTournament(tournament.id)
    toast.success(`« ${tournament.name} » supprimé.`)
    navigate("/tournaments")
  }

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
          <h1 className="truncate text-xl font-semibold tracking-tight text-ink">
            {tournament?.name ?? "Espace tournoi"}
          </h1>
          {status && (
            <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", status.cls)}>
              {status.label}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Basculer le thème clair / sombre"
              className="grid size-9 place-items-center rounded-lg text-ink-muted transition hover:bg-neutral-100 hover:text-ink"
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>

            {tournament && (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Actions du tournoi"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="grid size-9 place-items-center rounded-lg text-ink-muted transition hover:bg-neutral-100 hover:text-ink"
                >
                  <MoreVertical className="size-5" />
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-11 z-30 w-56 rounded-xl border border-border bg-surface-raised p-1.5 shadow-lg"
                  >
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        setInfoOpen(true)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink transition hover:bg-neutral-100"
                    >
                      <Pencil className="size-4 text-ink-muted" /> Modifier les informations
                    </button>
                    <div className="my-1 h-px bg-border" />
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        setConfirmOpen(true)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-danger-600 transition hover:bg-danger-50"
                    >
                      <Trash2 className="size-4" /> Supprimer le tournoi
                    </button>
                  </div>
                )}
              </div>
            )}
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

      {tournament && (
        <>
          <TournamentInfoSheet tournament={tournament} open={infoOpen} onOpenChange={setInfoOpen} />
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={`Supprimer « ${tournament.name} » ?`}
            description="Cette action est irréversible. Le tournoi et tout son espace de travail seront définitivement retirés."
            confirmLabel="Supprimer le tournoi"
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  )
}
