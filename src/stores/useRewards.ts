import { create } from "zustand"
import { nanoid } from "nanoid"
import type { Reward } from "@/data/types"
import seed from "@/data/seed/rewards.json"

/** See useTeams.ts for the canonical store template this follows. */
export type RewardInput = Omit<Reward, "id">

interface RewardsState {
  rewards: Reward[]
  addReward: (input: RewardInput) => Reward
  updateReward: (id: string, patch: Partial<RewardInput>) => void
  removeReward: (id: string) => void
}

export const useRewards = create<RewardsState>()((set) => ({
  rewards: seed as Reward[],

  addReward: (input) => {
    const reward: Reward = { ...input, id: nanoid() }
    set((state) => ({ rewards: [...state.rewards, reward] }))
    return reward
  },

  updateReward: (id, patch) =>
    set((state) => ({
      rewards: state.rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),

  removeReward: (id) =>
    set((state) => ({ rewards: state.rewards.filter((r) => r.id !== id) })),
}))
