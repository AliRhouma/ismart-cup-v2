import type { BadgeVariant } from "@/components/kit/Badge"
import type { Match, Phase, PhaseGroup, PhaseKind } from "@/data/types"

/**
 * Derived helpers for the Tirage. Everything here is COMPUTED from the phase
 * structure + its matches — nothing is stored. Shared across the rail, the
 * panel header, and (later) the configurator / tables.
 */

export const KIND_BADGE: Record<PhaseKind, { label: string; variant: BadgeVariant }> = {
  GROUPS: { label: "Phase de poules", variant: "brand" },
  KNOCKOUT: { label: "Élimination directe", variant: "info" },
  MATCHES: { label: "Matchs", variant: "neutral" },
}

export const UNCONFIGURED_BADGE = { label: "À configurer", variant: "warning" as BadgeVariant }

/** Matches belonging to a phase (structural link via phaseId). */
export const matchesOfPhase = (matches: Match[], phaseId: string) =>
  matches.filter((m) => m.phaseId === phaseId)

/** Short config summary line, derived from the structure. */
export function phaseSummary(phase: Phase, phaseMatches: Match[]): string {
  if (!phase.kind) return "À configurer"
  if (phase.kind === "GROUPS") {
    const groups = phase.groups ?? []
    const per = groups[0]?.slots.length ?? 0
    return `${groups.length} poule${groups.length > 1 ? "s" : ""} × ${per}`
  }
  const n = phaseMatches.length
  const noun = phase.kind === "KNOCKOUT" ? "rencontre" : "match"
  return `${n} ${noun}${n > 1 ? "s" : ""}`
}

export interface PhaseCheckpoints {
  /** A format has been chosen. */
  configured: boolean
  /** Every slot filled (GROUPS) / both sides are real teams (KNOCKOUT/MATCHES). */
  teamsAssigned: boolean
  /** At least one result has been entered. */
  hasResults: boolean
}

export function phaseCheckpoints(phase: Phase, phaseMatches: Match[]): PhaseCheckpoints {
  const configured = phase.kind != null
  let teamsAssigned = false
  if (phase.kind === "GROUPS") {
    const slots = (phase.groups ?? []).flatMap((g) => g.slots)
    teamsAssigned = slots.length > 0 && slots.every((s) => s != null)
  } else if (phase.kind) {
    teamsAssigned = phaseMatches.length > 0 && phaseMatches.every((m) => !!m.team1Id && !!m.team2Id)
  }
  const hasResults = phaseMatches.some((m) => m.status === "COMPLETED" || m.status === "FORFEIT")
  return { configured, teamsAssigned, hasResults }
}

/** Points rules — sourced from the tournament (Paramètres), with FIFA defaults. */
export interface PointsRules {
  win: number
  draw: number
  loss: number
}
export const DEFAULT_POINTS: PointsRules = { win: 3, draw: 1, loss: 0 }

/** One computed standings row (never stored). */
export interface StandingRow {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}

/**
 * Standings for one group, COMPUTED from its decided matches. Counts COMPLETED
 * and FORFEIT (the forfeit already carries its 0–3 score). Ordered by Pts →
 * différence de buts → buts pour (a simple stand-in for ClassificationCriteria).
 */
export function computeGroupStandings(
  group: PhaseGroup,
  groupMatches: Match[],
  points: PointsRules = DEFAULT_POINTS,
): StandingRow[] {
  const teamIds = group.slots.filter((s): s is string => s != null)
  const rows = new Map<string, StandingRow>(
    teamIds.map((id) => [
      id,
      { teamId: id, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 },
    ]),
  )

  for (const m of groupMatches) {
    if (m.status !== "COMPLETED" && m.status !== "FORFEIT") continue
    if (m.team1Id == null || m.team2Id == null || m.score1 == null || m.score2 == null) continue
    const a = rows.get(m.team1Id)
    const b = rows.get(m.team2Id)
    if (!a || !b) continue // a team not in this group's slots — ignore defensively
    a.played++, b.played++
    a.goalsFor += m.score1
    a.goalsAgainst += m.score2
    b.goalsFor += m.score2
    b.goalsAgainst += m.score1
    if (m.score1 > m.score2) {
      a.won++, b.lost++, (a.points += points.win), (b.points += points.loss)
    } else if (m.score1 < m.score2) {
      b.won++, a.lost++, (b.points += points.win), (a.points += points.loss)
    } else {
      a.drawn++, b.drawn++, (a.points += points.draw), (b.points += points.draw)
    }
  }

  const list = [...rows.values()]
  for (const r of list) r.goalDiff = r.goalsFor - r.goalsAgainst
  return list.sort(
    (x, y) => y.points - x.points || y.goalDiff - x.goalDiff || y.goalsFor - x.goalsFor,
  )
}

/** Decided winner side of a completed match (penalties break a draw). null otherwise. */
export function matchWinner(m: Match): 1 | 2 | null {
  if (m.status !== "COMPLETED" && m.status !== "FORFEIT") return null
  if (m.score1 == null || m.score2 == null) return null
  if (m.score1 > m.score2) return 1
  if (m.score2 > m.score1) return 2
  if (m.hasPenalties && m.penaltyScore1 != null && m.penaltyScore2 != null) {
    if (m.penaltyScore1 > m.penaltyScore2) return 1
    if (m.penaltyScore2 > m.penaltyScore1) return 2
  }
  return null
}

/** +N / 0 / −N for the goal-difference column. */
export const signedDiff = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0")
