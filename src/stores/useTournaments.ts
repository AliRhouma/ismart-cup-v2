import { create } from "zustand"
import { nanoid } from "nanoid"
import type { Tournament } from "@/data/types"
import seed from "@/data/seed/tournaments.json"

/** See useTeams.ts for the canonical store template this follows. */
export type TournamentInput = Omit<Tournament, "id">

interface TournamentsState {
  tournaments: Tournament[]
  addTournament: (input: TournamentInput) => Tournament
  updateTournament: (id: string, patch: Partial<TournamentInput>) => void
  removeTournament: (id: string) => void
}

export const useTournaments = create<TournamentsState>()((set) => ({
  tournaments: seed as Tournament[],

  addTournament: (input) => {
    const tournament: Tournament = { ...input, id: nanoid() }
    set((state) => ({ tournaments: [...state.tournaments, tournament] }))
    return tournament
  },

  updateTournament: (id, patch) =>
    set((state) => ({
      tournaments: state.tournaments.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  removeTournament: (id) =>
    set((state) => ({ tournaments: state.tournaments.filter((t) => t.id !== id) })),
}))
