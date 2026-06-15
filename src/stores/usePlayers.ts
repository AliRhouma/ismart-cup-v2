import { create } from "zustand"
import { nanoid } from "nanoid"
import type { Player } from "@/data/types"
import seed from "@/data/seed/players.json"

/** See useTeams.ts for the canonical store template this follows. */
export type PlayerInput = Omit<Player, "id">

interface PlayersState {
  players: Player[]
  addPlayer: (input: PlayerInput) => Player
  updatePlayer: (id: string, patch: Partial<PlayerInput>) => void
  removePlayer: (id: string) => void
}

export const usePlayers = create<PlayersState>()((set) => ({
  players: seed as Player[],

  addPlayer: (input) => {
    const player: Player = { ...input, id: nanoid() }
    set((state) => ({ players: [...state.players, player] }))
    return player
  },

  updatePlayer: (id, patch) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  removePlayer: (id) =>
    set((state) => ({ players: state.players.filter((p) => p.id !== id) })),
}))
