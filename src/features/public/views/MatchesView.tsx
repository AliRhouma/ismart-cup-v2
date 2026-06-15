import { CalendarDays } from "lucide-react"
import { usePublicData } from "../PublicLayout"
import ViewSection from "../ViewSection"
import MatchList from "../MatchList"

/** Matchs — the full upcoming fixture list, grouped by day. */
export default function MatchesView() {
  const { view } = usePublicData()
  return (
    <ViewSection icon={CalendarDays} title="Matchs à venir" subtitle="Le calendrier des prochaines rencontres">
      <MatchList matches={view.upcoming} empty="Tous les matchs ont été joués — rendez-vous dans les résultats." />
    </ViewSection>
  )
}
