/**
 * Domain types for the iSmart-Cup prototype.
 * Every entity carries `id: string`. Field names follow docs/data-plan.md (and
 * docs/schema.prisma where a screen shows the field). No backend: these shapes
 * are seeded into Zustand stores and mutated in memory for the session.
 */

export type TournamentStatus = "upcoming" | "active" | "finished"

/** Pitch surface — real schema enum (schema.prisma `SurfaceType`). */
export type SurfaceType = "NATURAL" | "SYNTHETIC" | "MIXED"

export interface Tournament {
  id: string
  name: string
  description?: string
  /** Discipline shown on the overview, e.g. "Football". */
  sport?: string
  category?: string
  status: TournamentStatus
  /** ISO date string, e.g. "2026-04-01". */
  startDate: string
  endDate?: string
  /** Capacity — the denominator in "6 / 12 inscrites". */
  numberOfTeams?: number
  numberOfPlayersPerTeam?: number
  surfaceType?: SurfaceType
  address?: string
  picture?: string

  // ── Global constraints (Paramètres / "Contraintes Globales") ──
  /** Daily kick-off / wrap-up, "HH:MM" 24h — schema `startTime` / `endTime`. */
  startTime?: string
  endTime?: string
  /** Minutes between consecutive matches on a pitch (scheduling config). */
  pauseBetweenMatches?: number
  /** Optional lunch break — flattened from schema `TournamentDayPause`. */
  hasMiddayBreak?: boolean
  middayBreakStart?: string
  middayBreakEnd?: string
  /** Match format — schema `numberOfPeriods` / `PeriodDuration` (minutes). */
  numberOfPeriods?: number
  periodDuration?: number
  /** Points rules — flattened from schema `PhaseConfiguration` / `configuration`. */
  pointsForWin?: number
  pointsForDraw?: number
  pointsForLoss?: number
  /** Goals awarded to the present team on a forfeit. */
  forfeitScore?: number

  /**
   * Stored registered-team count for the tournaments-list card. Screens that
   * have the teams store COMPUTE the live count from it instead of reading this.
   */
  teamCount: number
}

export interface Team {
  id: string
  tournamentId: string
  name: string
  category: string
  favorite: boolean
}

/** A team's roster member — schema.prisma `Player` (slimmed). */
export interface Player {
  id: string
  teamId: string
  name: string
  position?: string
}

/** A pitch/venue within a tournament — schema.prisma `Stadium`. */
export interface Stadium {
  id: string
  tournamentId: string
  name: string
  location: string
}

export type MatchStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "FORFEIT"

/**
 * The structured criterion behind a placeholder side — a flattened
 * schema.prisma `TeamSlotCriterion`. `team1Placeholder` is the display string
 * other screens already read; this is the machine-readable twin the Tirage
 * uses to render richer chips and to drive the MANUAL "pousser" resolution
 * (never an automatic global solve).
 *   - rank: CriterionSourceType.COMPONENT  → "Rang N de {groupName}"
 *   - winner/loser: CriterionSourceType.MATCH + MatchOutcome → references a match
 */
export type SlotSource =
  | { kind: "rank"; groupName: string; rank: number }
  | { kind: "winner" | "loser"; matchId: string }

/**
 * A fixture/result. Flattened from schema.prisma `Match` + `TeamSlot` + Phase
 * labels: a match just carries team ids (or a placeholder string when the team
 * isn't decided yet) — never slots/criteria. The Tirage adds `phaseId` (the
 * structural link, flattened from `Match.componentId → Component → Phase`) and
 * an optional `SlotSource` per side.
 */
export interface Match {
  id: string
  tournamentId: string
  /** Structural link to the owning phase (Tirage). */
  phaseId?: string
  name?: string
  /** Label of the owning phase, e.g. "Phase de Poules". */
  phaseName?: string
  /** Group label for group-stage display, e.g. "Poule A". */
  group?: string
  roundNumber?: number
  team1Id?: string
  team2Id?: string
  team1Placeholder?: string
  team2Placeholder?: string
  /** Structured criteria behind the placeholders (Tirage). */
  team1Source?: SlotSource
  team2Source?: SlotSource
  status: MatchStatus
  /** ISO date. */
  date?: string
  startTime?: string
  stadiumId?: string
  score1?: number
  score2?: number
  hasPenalties?: boolean
  penaltyScore1?: number
  penaltyScore2?: number
}

/** Display status for the progression stepper. */
export type PhaseStatus = "done" | "current" | "upcoming"

/**
 * The shape of a phase, flattened from schema.prisma `ComponentType`:
 *   - GROUPS   ← POOL          (groups with standings tables)
 *   - KNOCKOUT ← BRACKET       (matchup cards, sides may be placeholders)
 *   - MATCHES  ← MATCHES       (free fixtures)
 * POT and INTER_GROUP are deliberately NOT modeled — their outcomes surface as
 * placeholder chips ("Meilleur 2e", "Rang 1 de Poule A").
 */
export type PhaseKind = "GROUPS" | "KNOCKOUT" | "MATCHES"

/**
 * One group inside a GROUPS phase — a flattened schema.prisma `Component`
 * (type POOL). Its `slots` are the flattened `TeamSlot`s: a fixed-length array
 * (length = teams per group) of teamId-or-null. Group membership lives here,
 * NOT on the team. The standings table is COMPUTED from the group's matches.
 */
export interface PhaseGroup {
  id: string
  /** Real Component.name, e.g. "Poule A". */
  name: string
  /** Fixed length = teams per group; each entry is a teamId or null (empty). */
  slots: (string | null)[]
}

/**
 * A tournament phase. Extends the original slim shape (the Aperçu stepper still
 * reads only `name`/`order`/`status`). The Tirage adds `kind` (undefined ⇒
 * created but not yet configured) and, for GROUPS phases, the `groups`. The
 * phase config (nb de groupes × équipes, nb de rencontres) is NOT stored — it
 * is DERIVED from the structure (groups/slots, or the count of phase matches).
 */
export interface Phase {
  id: string
  tournamentId: string
  name: string
  order: number
  status: PhaseStatus
  /** undefined ⇒ phase exists but hasn't been configured yet. */
  kind?: PhaseKind
  /** GROUPS only — the phase's groups (each a flattened POOL Component). */
  groups?: PhaseGroup[]
}

/** schema.prisma `AnnouncementType`. */
export type AnnouncementType = "ANNOUNCEMENT" | "DELAY"

/** A news item / notice — schema.prisma `Announcement`. */
export interface Announcement {
  id: string
  tournamentId: string
  type: AnnouncementType
  /** ISO date. */
  date: string
  name: string
  description?: string
}

/**
 * Prize / reward line for the "Prix et Récompenses" section. No backend model
 * backs this yet — prototype-only content; `kind` drives the icon.
 */
export type RewardKind = "trophy" | "medal" | "individual"

export interface Reward {
  id: string
  tournamentId: string
  title: string
  description?: string
  kind: RewardKind
}

/** schema.prisma `FormSubmissionStatus`. */
export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED"

/**
 * A club's request to join the tournament — the "Demande du club" table.
 * Flattens schema.prisma `FormSubmission` (status/`submittedAt`) +
 * `TournamentParticipantResponsible` (the responsible person) + the proposed
 * roster size into the few fields the dashboard shows.
 */
export interface Registration {
  id: string
  tournamentId: string
  clubName: string
  responsibleName: string
  playersCount: number
  status: RegistrationStatus
  /** ISO date — schema `submittedAt`. */
  date: string
}

/** Referee role — data-plan Referee.category. */
export type RefereeCategory = "MAIN" | "ASSISTANT" | "VAR"

/** A match official — schema.prisma `Referee` (slimmed). */
export interface Referee {
  id: string
  tournamentId: string
  name: string
  category: RefereeCategory
  picture?: string
}
