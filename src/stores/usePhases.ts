import { create } from "zustand"
import { nanoid } from "nanoid"
import type { Phase, PhaseGroup } from "@/data/types"
import seed from "@/data/seed/phases.json"
import { useMatches } from "@/stores/useMatches"

/**
 * Phase store for the Tirage (phase builder). Extends the canonical CRUD shape
 * with the structure actions the screen needs. Phases own their GROUPS
 * structure; KNOCKOUT/MATCHES matchups live in useMatches (linked by phaseId),
 * so results ripple to Calendrier/Résultats for free. This store reaches into
 * useMatches for cascade-delete, rename-sync and fixture generation — there's
 * no cycle (useMatches never imports back).
 */
export type PhaseInput = Omit<Phase, "id">

/** Config passed to configurePhase — encodes the structure to build/rebuild. */
export type PhaseConfig =
  | { kind: "GROUPS"; numberOfGroups: number; teamsPerGroup: number }
  | { kind: "KNOCKOUT"; numberOfMatchups: number }
  | { kind: "MATCHES"; numberOfMatches: number }

interface PhasesState {
  phases: Phase[]
  addPhase: (input: PhaseInput) => Phase
  updatePhase: (id: string, patch: Partial<PhaseInput>) => void
  /** Rename a phase and sync the denormalized phaseName on its matches. */
  renamePhase: (id: string, name: string) => void
  /** Delete a phase AND cascade-delete its matches (schema onDelete: Cascade). */
  removePhase: (id: string) => void
  /** Move a phase one step earlier/later among its tournament's phases. */
  reorderPhase: (id: string, direction: "up" | "down") => void
  /** Set the phase kind and build its structure (resets any prior structure). */
  configurePhase: (id: string, config: PhaseConfig) => void
  /** GROUPS: place (or clear, with null) a team in one group slot. */
  assignTeam: (phaseId: string, groupId: string, slotIndex: number, teamId: string | null) => void
  /** GROUPS: shuffle the given available teams into the phase's empty slots. */
  autoDraw: (phaseId: string, availableTeamIds: string[]) => void
  /** GROUPS: empty every slot of the phase. */
  clearAssignments: (phaseId: string) => void
  /** GROUPS: create the round-robin fixtures for a full group (no-op otherwise). */
  generateGroupMatches: (phaseId: string, groupId: string) => void
}

const groupLetter = (i: number) => String.fromCharCode(65 + i) // 0→A, 1→B…

/** Fisher–Yates shuffle (UI-time randomness; ids still use nanoid). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const usePhases = create<PhasesState>()((set, get) => ({
  phases: seed as Phase[],

  addPhase: (input) => {
    const phase: Phase = { ...input, id: nanoid() }
    set((state) => ({ phases: [...state.phases, phase] }))
    return phase
  },

  updatePhase: (id, patch) =>
    set((state) => ({
      phases: state.phases.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  renamePhase: (id, name) => {
    set((state) => ({
      phases: state.phases.map((p) => (p.id === id ? { ...p, name } : p)),
    }))
    // Keep other screens dumb: sync the denormalized label on the phase's matches.
    const { matches, updateMatch } = useMatches.getState()
    for (const m of matches) if (m.phaseId === id) updateMatch(m.id, { phaseName: name })
  },

  removePhase: (id) => {
    set((state) => ({ phases: state.phases.filter((p) => p.id !== id) }))
    const { matches, removeMatch } = useMatches.getState()
    for (const m of matches) if (m.phaseId === id) removeMatch(m.id)
  },

  reorderPhase: (id, direction) =>
    set((state) => {
      const phase = state.phases.find((p) => p.id === id)
      if (!phase) return {}
      const siblings = state.phases
        .filter((p) => p.tournamentId === phase.tournamentId)
        .sort((a, b) => a.order - b.order)
      const idx = siblings.findIndex((p) => p.id === id)
      const targetIdx = direction === "up" ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= siblings.length) return {}
      const neighbour = siblings[targetIdx]
      // Swap the two order values.
      return {
        phases: state.phases.map((p) => {
          if (p.id === phase.id) return { ...p, order: neighbour.order }
          if (p.id === neighbour.id) return { ...p, order: phase.order }
          return p
        }),
      }
    }),

  configurePhase: (id, config) => {
    const phase = get().phases.find((p) => p.id === id)
    if (!phase) return

    // Reset any prior structure: delete this phase's matches, drop its groups.
    const { matches, removeMatch, addMatch } = useMatches.getState()
    for (const m of matches) if (m.phaseId === id) removeMatch(m.id)

    if (config.kind === "GROUPS") {
      const groups: PhaseGroup[] = Array.from({ length: config.numberOfGroups }, (_, i) => ({
        id: nanoid(),
        name: `Poule ${groupLetter(i)}`,
        slots: Array.from({ length: config.teamsPerGroup }, () => null),
      }))
      set((state) => ({
        phases: state.phases.map((p) =>
          p.id === id ? { ...p, kind: "GROUPS", groups } : p,
        ),
      }))
    } else {
      const count = config.kind === "KNOCKOUT" ? config.numberOfMatchups : config.numberOfMatches
      for (let k = 1; k <= count; k++) {
        addMatch({
          tournamentId: phase.tournamentId,
          phaseId: id,
          phaseName: phase.name,
          name: `Rencontre ${k}`,
          roundNumber: 1,
          status: "SCHEDULED",
          team1Placeholder: "À déterminer",
          team2Placeholder: "À déterminer",
        })
      }
      set((state) => ({
        phases: state.phases.map((p) =>
          p.id === id ? { ...p, kind: config.kind, groups: undefined } : p,
        ),
      }))
    }
  },

  assignTeam: (phaseId, groupId, slotIndex, teamId) =>
    set((state) => ({
      phases: state.phases.map((p) => {
        if (p.id !== phaseId || !p.groups) return p
        return {
          ...p,
          groups: p.groups.map((g) => {
            const slots = [...g.slots]
            // A team lives in at most one slot of the phase — clear it elsewhere.
            if (teamId) {
              for (let i = 0; i < slots.length; i++) if (slots[i] === teamId) slots[i] = null
            }
            if (g.id === groupId) slots[slotIndex] = teamId
            return { ...g, slots }
          }),
        }
      }),
    })),

  autoDraw: (phaseId, availableTeamIds) =>
    set((state) => {
      const pool = shuffle(availableTeamIds)
      return {
        phases: state.phases.map((p) => {
          if (p.id !== phaseId || !p.groups) return p
          return {
            ...p,
            groups: p.groups.map((g) => ({
              ...g,
              slots: g.slots.map((s) => (s == null && pool.length ? pool.shift()! : s)),
            })),
          }
        }),
      }
    }),

  clearAssignments: (phaseId) =>
    set((state) => ({
      phases: state.phases.map((p) =>
        p.id === phaseId && p.groups
          ? { ...p, groups: p.groups.map((g) => ({ ...g, slots: g.slots.map(() => null) })) }
          : p,
      ),
    })),

  generateGroupMatches: (phaseId, groupId) => {
    const phase = get().phases.find((p) => p.id === phaseId)
    const group = phase?.groups?.find((g) => g.id === groupId)
    if (!phase || !group) return
    const teamIds = group.slots.filter((s): s is string => s != null)
    if (teamIds.length < group.slots.length) return // only a full group

    const { matches, addMatch } = useMatches.getState()
    // Don't double-generate.
    if (matches.some((m) => m.phaseId === phaseId && m.group === group.name)) return

    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        addMatch({
          tournamentId: phase.tournamentId,
          phaseId,
          phaseName: phase.name,
          group: group.name,
          roundNumber: 1,
          team1Id: teamIds[i],
          team2Id: teamIds[j],
          status: "SCHEDULED",
        })
      }
    }
  },
}))
