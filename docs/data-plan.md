# iSmart-Cup Prototype — Data Plan (slim, screen-driven)

Source of truth for the REAL backend is `docs/schema.prisma`. This file is the
**prototype slice**: only the entities and fields the screens display, using the
real field names where they exist, with the backend engine flattened away.

## The three rules
1. **Model labels + results, not the engine.** The real schema's Phase / Component /
   TeamSlot / TeamSlotCriterion / Pot / MatchTie graph is how the backend *computes*
   the bracket. The prototype only *shows* the outcome, so a match carries team IDs
   (or a placeholder string when the team isn't decided yet) — never slots/criteria.
2. **Real names where a screen shows it.** Use `score1/score2`, `penaltyScore1/2`,
   `status`, `roundNumber`, `stadiumId`, etc., exactly as the schema names them, so
   wiring a real API later is mostly a rename-free swap.
3. **IDs are strings in the prototype** (readable slugs in seed like `team-psg`,
   `nanoid()` for created rows) even though the real DB uses int autoincrement.
   Every entity except Tournament carries a `tournamentId`.

---

## Entities to build (only these)

### Tournament  — screen: Mes Tournois (image 3), Aperçu, Paramètres
- `id` string
- `name` string
- `description?` string
- `sport?` string · `category?` string
- `status` `'DRAFT' | 'ACTIVE' | 'COMPLETED'`   (UI: COMPLETED → "Terminé")
- `startDate` ISO · `endDate?` ISO
- `numberOfTeams?` number   (capacity — the denominator in "16/16")
- `numberOfPlayersPerTeam?` number
- `surfaceType?` `'NATURAL' | 'SYNTHETIC' | 'MIXED'`
- `address?` string
- `picture?` string (logo URL)
> Registered count ("16/16") is COMPUTED = teams in this tournament ÷ numberOfTeams. Don't store it.

### Team  — screen: Équipes, Résultats, Match detail, Standings
- `id` string · `tournamentId` string
- `name` string
- `picture?` string
- `seed?` number · `isHost?` boolean
> Real schema links team↔tournament through `TournamentParticipant`. Flattened to `tournamentId` here.

### Player  — screen: Match detail → Joueurs / Composition
- `id` string · `teamId` string
- `name` string
- `position?` string
- `picture?` string · `birthdate?` ISO · `idIsmartClub?` string

### Referee  — screen: Arbitres, Résultats filter
- `id` string · `tournamentId` string
- `name` string · `picture?` string
- `category` `'MAIN' | 'ASSISTANT' | 'VAR'`

### Stadium  — screen: Calendrier, Résultats, Match detail
- `id` string · `tournamentId` string
- `name` string · `location` string

### Match  — screen: Résultats (image 2), Calendrier, Match detail (image 1), Tirage
Flattened from `Match` + `TeamSlot` + Phase/Component labels.
- `id` string · `tournamentId` string
- `name?` string                         ("PSG vs Manchester United")
- `phaseName?` string                    ("Quarter Finals", "Group A")  ← real Phase/Component label
- `group?` string                        ("Group A") for group-stage display
- `roundNumber?` number                  (UI "Tour 1")
- `team1Id?` string · `team2Id?` string  (null when not decided yet)
- `team1Placeholder?` string · `team2Placeholder?` string
                                         ("1er Groupe A", "Vainqueur Match 3")  ← real TeamSlotCriterion
- `status` `'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FORFEIT'`
- `date?` ISO · `startTime?` string · `endTime?` string
- `stadiumId?` string · `refereeIds?` string[]
- `score1?` number · `score2?` number
- `hasExtraTime?` boolean · `extraTimeScore1?` number · `extraTimeScore2?` number
- `hasPenalties?` boolean · `penaltyScore1?` number · `penaltyScore2?` number   (UI "Tirs au but: 3-2")
- `periodType?` `'REGULAR' | 'EXTRA' | 'PENALTIES'`   (UI "Temps Régulier")
- `currentTime?` number (seconds — the 00:00 timer) · `numberOfPeriods?` number · `periodTime?` number
- `isFavorite?` boolean   (prototype stand-in for the real `DeviceFavorite`)

### MatchEvent  — screen: Match detail timeline / feed
- `id` string · `matchId` string
- `type` `'GOAL_SCORED' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'PENALTY_MISSED' | 'SHOOTOUT_GOAL' | 'SHOOTOUT_MISSED'`
- `minute` number
- `teamId?` string · `playerId?` string
- `assistById?` string                   (goals)
- `playerInId?` string · `playerOutId?` string   (substitutions)
- `goalType?` `'PENALTY' | 'OWN_GOAL' | 'FREE_KICK' | 'CORNER' | ...`
- `description?` string

### Lineup  — screen: Match detail → "Composition de match"
Simplest model: nest two lineups inside the match, each a list of player spots.
- `matchId` string
- `team1Spots` `{ playerId: string; x: number; y: number; isStarter: boolean }[]`
- `team2Spots` same shape
> Real schema: `GameLineup` + `PlayerLineup.coords`. Coords drive the pitch layout.

### Standing  — screen: group tables in Aperçu / Tableau de bord / Tirage
- `id` string · `tournamentId` string
- `group` string                         ("Group A")  ← real Component
- `teamId` string · `rank` number · `points` number
- `stats` `{ played, won, drawn, lost, goalsFor, goalsAgainst, goalDiff }`
> Can be COMPUTED from matches instead of stored — prefer computing once you have matches.

### Phase / PhaseGroup  — screen: Tirage (phase builder)
Flattened from the engine graph (Phase → Component → TeamSlot/TeamSlotCriterion; Pot/PotSlot).
We model only what the screen builds and shows; the engine is **simulated, not rebuilt**.
- `Phase`  `id` · `tournamentId` · `name` · `order` · `status` (`'done'|'current'|'upcoming'` — Aperçu stepper)
  - `kind?` `'GROUPS' | 'KNOCKOUT' | 'MATCHES'`  ← ComponentType POOL / BRACKET / MATCHES. `undefined` = created, not yet configured.
  - `groups?` `PhaseGroup[]`  (GROUPS only)
- `PhaseGroup`  `id` · `name` ("Poule A" — real Component.name) · `slots` `(teamId | null)[]`  ← flattened TeamSlots; length = teams per group. **Group membership lives here, not on the team.**
- Phase config (nb de groupes × équipes, nb de rencontres) is **NOT stored** — DERIVED from the structure (groups/slots, or the count of phase matches).
- KNOCKOUT/MATCHES matchups ARE `Match` rows, linked by the new **`Match.phaseId`** (flattened `Match.componentId → Component → Phase`). Results entered there ripple to Calendrier/Résultats for free.
- A placeholder side carries `Match.team{1,2}Placeholder` (display string other screens already read) plus an optional **`SlotSource`** (machine-readable twin, flattened `TeamSlotCriterion`):
  - `{ kind:'rank', groupName, rank }`        ← type COMPONENT + rank  ("1er Poule A")
  - `{ kind:'winner'|'loser', matchId }`      ← type MATCH + MatchOutcome  ("Gagnant - Demi-finale 1")
- Group standings (Position, MJ, V, N, D, DB, Pts) are **COMPUTED** from the group's matches using the tournament's points rules (Paramètres) — never stored.
> NOT modeled: Pot/PotSlot, INTER_GROUP, best-third seeding, ClassificationCriteria, ConflictRule. Their outcomes surface as muted "À déterminer" chips; resolution is a **manual** one-click "pousser le vainqueur", never an automatic global solve.

### Sponsor  — screen: Sponsors
- `id` string · `tournamentId` string
- `name` string · `logoUrl?` string · `websiteUrl?` string
- `isActive` boolean · `displayOrder` number
> Skip `SponsorBanner` and all rotation/placement fields until a sponsor-display screen needs them.

---

## Relationships (all by ID)
- Tournament → many Team, Match, Referee, Stadium, Sponsor, Standing
- Team → many Player; referenced by Match.team1Id/team2Id, Standing.teamId, MatchEvent.teamId
- Match → many MatchEvent; references two Teams, one Stadium, several Referees
- Stadium ← referenced by Match

## Deliberately SKIPPED (and why)
- **Auth & people:** User, TournamentToUser, TournamentParticipantResponsible + all
  permission flags — no login in a screens prototype.
- **Money:** PricingPackage, Subscription, all Stripe fields.
- **Push/notifs:** Notification, FCMPushNotification, MatchNotificationPreference.
- **Forms:** FormTemplate, FormField, FormSubmission — until a registration screen exists.
- **Scheduling internals:** TournamentDay(+Pause), StadiumAvailability/Pause/CustomPause,
  PhaseConfiguration — keep only the few timing fields a screen shows, on Match/Tournament.
- **Engine internals:** Phase, Component, Pot, PotSlot, TeamSlot, TeamSlotCriterion,
  MatchTie, RankingSlotCriterion, ConflictRule — replaced by simple label/placeholder strings.
- **Templates:** TournamentTemplate + all Template* — defer; a template is basically a
  Tournament with no participants. Only model if the "Modèles de tournoi" screen is built.
- **Infra:** File (use a plain `picture` URL string instead), SimulationAuditLog,
  isSimulation / simulationVersionId fields, audit/timestamps (createdAt/updatedAt/deletedAt).

---

## Instruction to paste to Claude Code
> `docs/schema.prisma` is the real backend (reference only). `docs/data-plan.md` is
> the prototype data slice — build types and seed JSON from it. Use the real field
> names it lists, keep IDs as strings, and put `tournamentId` on every entity except
> Tournament. Do NOT model the engine (Phase/Component/TeamSlot/Criteria/Pot/MatchTie):
> a match carries `team1Id`/`team2Id` or a placeholder string. Compute Standings and the
> registered-team count rather than storing them. Add a field only when a screen needs
> it; look it up in `schema.prisma` first instead of inventing one.