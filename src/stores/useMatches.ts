import { create } from "zustand"
import { nanoid } from "nanoid"
import type { Match } from "@/data/types"
import seed from "@/data/seed/matches.json"

/** See useTeams.ts for the canonical store template this follows. */
export type MatchInput = Omit<Match, "id">

interface MatchesState {
  matches: Match[]
  addMatch: (input: MatchInput) => Match
  updateMatch: (id: string, patch: Partial<MatchInput>) => void
  removeMatch: (id: string) => void
}

export const useMatches = create<MatchesState>()((set) => ({
  matches: seed as Match[],

  addMatch: (input) => {
    const match: Match = { ...input, id: nanoid() }
    set((state) => ({ matches: [...state.matches, match] }))
    return match
  },

  updateMatch: (id, patch) =>
    set((state) => ({
      matches: state.matches.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),

  removeMatch: (id) =>
    set((state) => ({ matches: state.matches.filter((m) => m.id !== id) })),
}))
