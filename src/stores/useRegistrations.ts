import { create } from "zustand"
import { nanoid } from "nanoid"
import type { Registration } from "@/data/types"
import seed from "@/data/seed/registrations.json"

/** See useTeams.ts for the canonical store template this follows. */
export type RegistrationInput = Omit<Registration, "id">

interface RegistrationsState {
  registrations: Registration[]
  addRegistration: (input: RegistrationInput) => Registration
  updateRegistration: (id: string, patch: Partial<RegistrationInput>) => void
  removeRegistration: (id: string) => void
}

export const useRegistrations = create<RegistrationsState>()((set) => ({
  registrations: seed as Registration[],

  addRegistration: (input) => {
    const registration: Registration = { ...input, id: nanoid() }
    set((state) => ({ registrations: [...state.registrations, registration] }))
    return registration
  },

  updateRegistration: (id, patch) =>
    set((state) => ({
      registrations: state.registrations.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),

  removeRegistration: (id) =>
    set((state) => ({ registrations: state.registrations.filter((r) => r.id !== id) })),
}))
