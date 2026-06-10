/**
 * Domain types for the iSmart-Cup prototype.
 * Every entity carries `id: string`. Kept intentionally minimal — extend as
 * real features land. No backend: these shapes are seeded into Zustand stores.
 */

export type TournamentStatus = "upcoming" | "active" | "finished"

export interface Tournament {
  id: string
  name: string
  /** ISO date string, e.g. "2026-04-01". */
  startDate: string
  status: TournamentStatus
  teamCount: number
}

export interface Team {
  id: string
  tournamentId: string
  name: string
  category: string
  favorite: boolean
}
