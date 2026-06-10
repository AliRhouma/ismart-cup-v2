import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Simulate network latency so prototype CRUD "feels real" (no backend). */
export function fakeDelay(ms = 400) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
