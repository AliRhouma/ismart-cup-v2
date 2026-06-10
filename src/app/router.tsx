import { createBrowserRouter, Navigate } from "react-router-dom"
import TournamentList from "@/features/tournaments/TournamentList"
import WorkspaceLayout, { WORKSPACE_TABS } from "@/features/workspace/WorkspaceLayout"
import TabPlaceholder from "@/features/workspace/tabs/TabPlaceholder"

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/tournaments" replace /> },
  { path: "/tournaments", element: <TournamentList /> },
  {
    // Layout route: WorkspaceLayout renders the header + tab bar + <Outlet/>.
    path: "/tournaments/:id",
    element: <WorkspaceLayout />,
    children: WORKSPACE_TABS.map((tab) =>
      tab.index
        ? { index: true, element: <TabPlaceholder label={tab.label} /> }
        : { path: tab.to, element: <TabPlaceholder label={tab.label} /> },
    ),
  },
])
