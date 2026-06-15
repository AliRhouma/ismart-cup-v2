import { useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { CalendarDays, History, ListOrdered, Star } from "lucide-react"
import Avatar from "@/components/kit/Avatar"
import Badge from "@/components/kit/Badge"
import { cn } from "@/lib/utils"
import DetailHeader from "./DetailHeader"
import { usePublicLinks } from "./usePublicLinks"
import MatchList from "./MatchList"
import PoolStandings from "./PoolStandings"
import { getTeamView, resolveStatus } from "./mock"

const TABS = [
  { id: "matchs", label: "Matchs", icon: CalendarDays },
  { id: "resultats", label: "Résultats", icon: History },
  { id: "classement", label: "Classement", icon: ListOrdered },
] as const

/** Team page — identity header + 3 tabs: Matchs (à venir), Résultats, Classement. */
export default function TeamDetailPage() {
  const { teamId } = useParams()
  const [params] = useSearchParams()
  const status = resolveStatus(params.get("state"))
  const data = getTeamView(teamId ?? "", status)
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("resultats")

  return (
    <div className="min-h-screen bg-surface-subtle">
      <DetailHeader status={status} />
      <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6">
        {!data ? (
          <NotFound />
        ) : (
          <>
            {/* Identity */}
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <Avatar name={data.team.name} size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-xl font-semibold tracking-tight text-ink sm:text-2xl">{data.team.name}</h1>
                  {data.team.isHost && <Star aria-label="Équipe hôte" className="size-4 shrink-0 text-accent2-500" />}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Badge variant="brand">{data.team.pool}</Badge>
                  {data.team.isHost && <Badge variant="accent">Équipe hôte</Badge>}
                  <span className="text-xs text-ink-muted">{data.roster.length} joueurs</span>
                </div>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="mt-5 inline-flex w-full rounded-full bg-surface-muted p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={tab === t.id}
                  className={cn(
                    "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium transition",
                    tab === t.id ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
                  )}
                >
                  <t.icon className="size-4" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-5">
              {tab === "matchs" && <MatchList matches={data.upcoming} empty="Aucun match à venir pour cette équipe." />}
              {tab === "resultats" && <MatchList matches={data.results} empty="Aucun résultat pour cette équipe." />}
              {tab === "classement" && <PoolStandings pool={data.pool} highlightTeamId={data.team.id} />}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function NotFound() {
  const links = usePublicLinks()
  return (
    <div className="rounded-2xl border border-border bg-surface p-10 text-center">
      <p className="text-sm text-ink-muted">Équipe introuvable.</p>
      <Link to={links.home} className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">
        Retour à l'accueil
      </Link>
    </div>
  )
}
