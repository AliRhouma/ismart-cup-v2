import { create } from "zustand"
import { nanoid } from "nanoid"
import type { Announcement } from "@/data/types"
import seed from "@/data/seed/announcements.json"

/** See useTeams.ts for the canonical store template this follows. */
export type AnnouncementInput = Omit<Announcement, "id">

interface AnnouncementsState {
  announcements: Announcement[]
  addAnnouncement: (input: AnnouncementInput) => Announcement
  updateAnnouncement: (id: string, patch: Partial<AnnouncementInput>) => void
  removeAnnouncement: (id: string) => void
}

export const useAnnouncements = create<AnnouncementsState>()((set) => ({
  announcements: seed as Announcement[],

  addAnnouncement: (input) => {
    const announcement: Announcement = { ...input, id: nanoid() }
    set((state) => ({ announcements: [...state.announcements, announcement] }))
    return announcement
  },

  updateAnnouncement: (id, patch) =>
    set((state) => ({
      announcements: state.announcements.map((a) =>
        a.id === id ? { ...a, ...patch } : a,
      ),
    })),

  removeAnnouncement: (id) =>
    set((state) => ({
      announcements: state.announcements.filter((a) => a.id !== id),
    })),
}))
