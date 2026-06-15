import { History } from "lucide-react"
import { usePublicData } from "../PublicLayout"
import ViewSection from "../ViewSection"
import MatchList from "../MatchList"

/** Résultats — every played match, grouped by day, clickable to the timeline. */
export default function ResultsView() {
  const { view } = usePublicData()
  return (
    <ViewSection icon={History} title="Résultats" subtitle={`${view.results.length} match${view.results.length > 1 ? "s" : ""} joué${view.results.length > 1 ? "s" : ""} · appuyez pour le détail`}>
      <MatchList matches={view.results} empty="Le tournoi n'a pas encore commencé — rendez-vous au coup d'envoi." />
    </ViewSection>
  )
}
