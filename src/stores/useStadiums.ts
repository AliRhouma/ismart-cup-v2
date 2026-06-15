import { create } from "zustand"
import { nanoid } from "nanoid"
import type { Stadium } from "@/data/types"
import seed from "@/data/seed/stadiums.json"

/** See useTeams.ts for the canonical store template this follows. */
export type StadiumInput = Omit<Stadium, "id">

interface StadiumsState {
  stadiums: Stadium[]
  addStadium: (input: StadiumInput) => Stadium
  updateStadium: (id: string, patch: Partial<StadiumInput>) => void
  removeStadium: (id: string) => void
}

export const useStadiums = create<StadiumsState>()((set) => ({
  stadiums: seed as Stadium[],

  addStadium: (input) => {
    const stadium: Stadium = { ...input, id: nanoid() }
    set((state) => ({ stadiums: [...state.stadiums, stadium] }))
    return stadium
  },

  updateStadium: (id, patch) =>
    set((state) => ({
      stadiums: state.stadiums.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })),

  removeStadium: (id) =>
    set((state) => ({ stadiums: state.stadiums.filter((s) => s.id !== id) })),
}))
