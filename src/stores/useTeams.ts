import { create } from "zustand"
import { nanoid } from "nanoid"
import type { Team } from "@/data/types"
import seed from "@/data/seed/teams.json"

/**
 * CANONICAL STORE TEMPLATE — copy this file for every new domain.
 *
 * One Zustand store per domain, seeded from JSON, with add / update / remove.
 * No backend: state lives in memory for the session, so creates/edits persist
 * across navigation (the store is a module singleton). Pages derive their view
 * (e.g. filter by tournament) — keep the store CRUD-only.
 */

/** The shape callers pass to create/update — everything except the generated id. */
export type TeamInput = Omit<Team, "id">

interface TeamsState {
  teams: Team[]
  /** Add a new team; returns it (with its fresh nanoid id). */
  addTeam: (input: TeamInput) => Team
  /** Patch an existing team by id. */
  updateTeam: (id: string, patch: Partial<TeamInput>) => void
  /** Remove a team by id. */
  removeTeam: (id: string) => void
}

export const useTeams = create<TeamsState>()((set) => ({
  teams: seed as Team[],

  addTeam: (input) => {
    const team: Team = { ...input, id: nanoid() }
    set((state) => ({ teams: [...state.teams, team] }))
    return team
  },

  updateTeam: (id, patch) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  removeTeam: (id) =>
    set((state) => ({ teams: state.teams.filter((t) => t.id !== id) })),
}))
