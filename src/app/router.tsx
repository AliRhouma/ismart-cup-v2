import type { ReactNode } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import TournamentList from "@/features/tournaments/TournamentList"
import WorkspaceLayout, { WORKSPACE_TABS } from "@/features/workspace/WorkspaceLayout"
import TabPlaceholder from "@/features/workspace/tabs/TabPlaceholder"
import Apercu from "@/features/workspace/tabs/Apercu"
import TableauDeBord from "@/features/workspace/tabs/TableauDeBord"
import Parametres from "@/features/workspace/tabs/Parametres"
import Equipes from "@/features/workspace/tabs/Equipes"
import Arbitres from "@/features/workspace/tabs/Arbitres"
import Tirage from "@/features/workspace/tabs/Tirage"
import PublicLayout from "@/features/public/PublicLayout"
import TodayView from "@/features/public/views/TodayView"
import ResultsView from "@/features/public/views/ResultsView"
import MatchesView from "@/features/public/views/MatchesView"
import StandingsView from "@/features/public/views/StandingsView"
import MatchDetailPage from "@/features/public/MatchDetailPage"
import TeamDetailPage from "@/features/public/TeamDetailPage"
import LandingPage from "@/features/landing/LandingPage"

// Real tab screens by tab id. Tabs absent here render a placeholder for now —
// add an entry as each tab is built out.
const TAB_ELEMENTS: Record<string, ReactNode> = {
  apercu: <Apercu />,
  dashboard: <TableauDeBord />,
  parametres: <Parametres />,
  equipes: <Equipes />,
  arbitres: <Arbitres />,
  tirage: <Tirage />,
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/tournaments" replace /> },
  { path: "/tournaments", element: <TournamentList /> },
  // Marketing landing — standalone, self-contained styles. Shareable link.
  { path: "/landing", element: <LandingPage /> },
  // Public spectator vitrine — standalone, NOT wrapped by the admin shells.
  {
    path: "/t/:slug",
    element: <PublicLayout />,
    children: [
      { index: true, element: <TodayView /> },
      { path: "resultats", element: <ResultsView /> },
      { path: "matchs", element: <MatchesView /> },
      { path: "classement", element: <StandingsView /> },
    ],
  },
  { path: "/t/:slug/match/:matchId", element: <MatchDetailPage /> },
  { path: "/t/:slug/team/:teamId", element: <TeamDetailPage /> },
  {
    // Layout route: WorkspaceLayout renders the header + tab bar + <Outlet/>.
    path: "/tournaments/:id",
    element: <WorkspaceLayout />,
    children: WORKSPACE_TABS.map((tab) => {
      const element = TAB_ELEMENTS[tab.id] ?? <TabPlaceholder label={tab.label} />
      return tab.index
        ? { index: true, element }
        : { path: tab.to, element }
    }),
  },
])
