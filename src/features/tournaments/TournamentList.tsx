import { Link } from "react-router-dom"
import { ChevronRight, Plus, Trophy } from "lucide-react"
import type { Tournament } from "@/data/types"
import { useTournaments } from "@/stores/useTournaments"

const STATUS: Record<Tournament["status"], { label: string; cls: string }> = {
  upcoming: { label: "À venir", cls: "bg-brand-50 text-brand-700" },
  active: { label: "Actif", cls: "bg-success-50 text-success-700" },
  finished: { label: "Terminé", cls: "bg-neutral-100 text-neutral-600" },
}

export default function TournamentList() {
  const tournaments = useTournaments((s) => s.tournaments)

  return (
    <div className="min-h-screen bg-surface-subtle">
      <main className="container py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Mes Tournois</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Gérez vos tournois et accédez à leur espace de travail.
            </p>
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Plus className="size-4" /> Ajouter
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => {
            const status = STATUS[t.status]
            return (
              <div key={t.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                      <Trophy className="size-5" />
                    </span>
                    <h3 className="font-semibold text-ink">{t.name}</h3>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.cls}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink-muted">
                  {t.teamCount} équipes · début{" "}
                  {new Date(t.startDate).toLocaleDateString("fr-FR")}
                </p>
                <div className="mt-4">
                  <Link
                    to={`/tournaments/${t.id}`}
                    className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-brand-foreground transition hover:bg-brand-700"
                  >
                    Gérer <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
