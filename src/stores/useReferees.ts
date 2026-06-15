import { create } from "zustand"
import { nanoid } from "nanoid"
import type { Referee } from "@/data/types"
import seed from "@/data/seed/referees.json"

/** See useTeams.ts for the canonical store template this follows. */
export type RefereeInput = Omit<Referee, "id">

interface RefereesState {
  referees: Referee[]
  addReferee: (input: RefereeInput) => Referee
  updateReferee: (id: string, patch: Partial<RefereeInput>) => void
  removeReferee: (id: string) => void
}

export const useReferees = create<RefereesState>()((set) => ({
  referees: seed as Referee[],

  addReferee: (input) => {
    const referee: Referee = { ...input, id: nanoid() }
    set((state) => ({ referees: [...state.referees, referee] }))
    return referee
  },

  updateReferee: (id, patch) =>
    set((state) => ({
      referees: state.referees.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),

  removeReferee: (id) =>
    set((state) => ({ referees: state.referees.filter((r) => r.id !== id) })),
}))
