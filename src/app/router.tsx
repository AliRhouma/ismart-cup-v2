import type { ReactNode } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import TournamentList from "@/features/tournaments/TournamentList"
import WorkspaceLayout, { WORKSPACE_TABS } from "@/features/workspace/WorkspaceLayout"
import TabPlaceholder from "@/features/workspace/tabs/TabPlaceholder"
import Equipes from "@/features/workspace/tabs/Equipes"

// Real tab screens by tab id. Tabs absent here render a placeholder for now —
// add an entry as each tab is built out.
const TAB_ELEMENTS: Record<string, ReactNode> = {
  equipes: <Equipes />,
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/tournaments" replace /> },
  { path: "/tournaments", element: <TournamentList /> },
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
