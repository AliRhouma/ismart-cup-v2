/**
 * PUBLIC vitrine — self-contained fake data + derived views.
 * ---------------------------------------------------------------------------
 * Deliberately decoupled from the prototype: never touches the Zustand stores /
 * `src/data/seed`. It invents its OWN full tournament — a Tunisian U17 beach-
 * soccer cup — so the spectator surface stands completely alone. The shape
 * mirrors the real public query (header + teams + standings per pool + matches),
 * extended with rosters and goal timelines so a match-detail page can exist.
 *
 * TIME MODEL — one dataset, a single demo "now".
 *   A match is "played" when its kick-off datetime <= now; a knockout side
 *   resolves to a real team once the match it depends on has been played. This
 *   makes "today's results + today's upcoming" meaningful and keeps the
 *   not-started / in-progress / finished views mutually consistent.
 *   ?state=upcoming|active|completed picks the demo `now` (default: active).
 */

export type PublicStatus = "upcoming" | "active" | "completed"
export type MatchStage = "group" | "semi" | "third" | "final"

export interface PublicTeam {
  id: string
  name: string
  shortName: string
  pool: string
  isHost?: boolean
  seed?: number
}

export interface PublicPlayer {
  id: string
  teamId: string
  name: string
  number: number
  position: "Gardien" | "Pivot" | "Ailier" | "Défenseur"
}

/** When a side's real identity becomes known. */
type SideDep = { kind: "always" } | { kind: "groups" } | { kind: "win" | "lose"; matchId: string }
interface RawSide {
  teamId: string
  placeholder: string
  dep: SideDep
}

interface RawMatch {
  id: string
  stage: MatchStage
  phaseLabel: string
  matchday?: number
  date: string // "2026-07-10"
  time: string // "18:30"
  stadium: string
  side1: RawSide
  side2: RawSide
  score1: number
  score2: number
  forfeit?: boolean
}

// ── Header ──────────────────────────────────────────────────────────────────
export const tournament = {
  slug: "hammamet-beach-2026",
  name: "iSmart Beach Cup — Hammamet 2026",
  sport: "Beach Soccer",
  category: "U17 Garçons",
  edition: "3ᵉ édition",
  startDate: "2026-07-10",
  endDate: "2026-07-14",
  venue: "Plage Yasmine",
  city: "Hammamet, Tunisie",
  pools: ["Poule A", "Poule B"],
}

const S1 = "Arène Beach Yasmine"
const S2 = "Terrain Sindbad"

// ── Teams (8 — two pools of four) ────────────────────────────────────────────
export const teams: PublicTeam[] = [
  { id: "ham", name: "Croissant Sportif de Hammamet", shortName: "Hammamet", pool: "Poule A", isHost: true, seed: 1 },
  { id: "sah", name: "Étoile du Sahel Beach", shortName: "É. du Sahel", pool: "Poule A", seed: 4 },
  { id: "djb", name: "Océan Club de Djerba", shortName: "Djerba", pool: "Poule A", seed: 6 },
  { id: "krk", name: "AS Kerkennah Sables", shortName: "Kerkennah", pool: "Poule A", seed: 7 },
  { id: "tun", name: "Espérance Plage de Tunis", shortName: "EP Tunis", pool: "Poule B", seed: 2 },
  { id: "nab", name: "Stade Nabeulien Beach Soccer", shortName: "Nabeul", pool: "Poule B", seed: 3 },
  { id: "biz", name: "Union Sportive de Bizerte", shortName: "Bizerte", pool: "Poule B", seed: 5 },
  { id: "sfx", name: "Club Sportif Sfaxien Plage", shortName: "Sfax", pool: "Poule B", seed: 8 },
]

const teamById = new Map(teams.map((t) => [t.id, t]))
export const getTeam = (id: string) => teamById.get(id)

// ── Rosters (6 per team — GK + 5) ────────────────────────────────────────────
const ROSTERS: Record<string, [string, PublicPlayer["position"]][]> = {
  ham: [["Skander Trabelsi", "Gardien"], ["Bilel Jebali", "Pivot"], ["Wael Mejri", "Ailier"], ["Hamza Gharbi", "Ailier"], ["Aziz Ben Salah", "Défenseur"], ["Firas Dridi", "Pivot"]],
  sah: [["Oussama Hamrouni", "Gardien"], ["Nidhal Khelifi", "Pivot"], ["Seif Chaabane", "Ailier"], ["Anis Sassi", "Ailier"], ["Maher Ferjani", "Défenseur"], ["Khalil Riahi", "Pivot"]],
  djb: [["Ramzi Toumi", "Gardien"], ["Zied Mansouri", "Pivot"], ["Sami Ayari", "Ailier"], ["Aymen Brahmi", "Ailier"], ["Hedi Nasri", "Défenseur"], ["Marwen Gabsi", "Pivot"]],
  krk: [["Chedi Lahmar", "Gardien"], ["Ghaith Bouazizi", "Pivot"], ["Iheb Haddad", "Ailier"], ["Nizar Ben Amor", "Ailier"], ["Taha Zaiane", "Défenseur"], ["Fares Ben Youssef", "Pivot"]],
  tun: [["Wassim Mahjoubi", "Gardien"], ["Adam Khemiri", "Pivot"], ["Rayen Sboui", "Ailier"], ["Malek Jaziri", "Ailier"], ["Yassine Ouali", "Défenseur"], ["Slim Bouzid", "Pivot"]],
  nab: [["Nourdine Benzarti", "Gardien"], ["Mohamed Aloui", "Pivot"], ["Ahmed Selmi", "Ailier"], ["Youssef Karray", "Ailier"], ["Hatem Lahbib", "Défenseur"], ["Zaher Mnasri", "Pivot"]],
  biz: [["Walid Cherni", "Gardien"], ["Karim Souissi", "Pivot"], ["Houssem Belhadj", "Ailier"], ["Achraf Guesmi", "Ailier"], ["Mehdi Rebai", "Défenseur"], ["Sabri Methnani", "Pivot"]],
  sfx: [["Tarek Ellouze", "Gardien"], ["Nader Fakhfakh", "Pivot"], ["Hichem Kammoun", "Ailier"], ["Imed Triki", "Ailier"], ["Bassem Charfi", "Défenseur"], ["Walid Masmoudi", "Pivot"]],
}

export const players: PublicPlayer[] = teams.flatMap((t) =>
  ROSTERS[t.id].map(([name, position], i) => ({ id: `${t.id}-${i + 1}`, teamId: t.id, name, number: i + 1, position })),
)
const outfield = (teamId: string) => players.filter((p) => p.teamId === teamId && p.position !== "Gardien")

// ── Matches ──────────────────────────────────────────────────────────────────
// Group: 1.Hammamet 2.Sahel (A) · 1.Tunis 2.Nabeul (B)
// Knockout: DF1 Hammamet>Nabeul · DF2 Tunis>Sahel · 3e Nabeul>Sahel · Finale Hammamet>Tunis
const grp = (teamId: string): RawSide => ({ teamId, placeholder: "", dep: { kind: "always" } })
const qual = (teamId: string, placeholder: string): RawSide => ({ teamId, placeholder, dep: { kind: "groups" } })
const winOf = (teamId: string, matchId: string, placeholder: string): RawSide => ({ teamId, placeholder, dep: { kind: "win", matchId } })
const loseOf = (teamId: string, matchId: string, placeholder: string): RawSide => ({ teamId, placeholder, dep: { kind: "lose", matchId } })

const RAW: RawMatch[] = [
  // Poule A · J1
  { id: "a1", stage: "group", phaseLabel: "Poule A", matchday: 1, date: "2026-07-10", time: "17:00", stadium: S1, side1: grp("ham"), side2: grp("krk"), score1: 6, score2: 2 },
  { id: "a2", stage: "group", phaseLabel: "Poule A", matchday: 1, date: "2026-07-10", time: "18:30", stadium: S1, side1: grp("sah"), side2: grp("djb"), score1: 4, score2: 3 },
  // Poule B · J1
  { id: "b1", stage: "group", phaseLabel: "Poule B", matchday: 1, date: "2026-07-10", time: "17:00", stadium: S2, side1: grp("tun"), side2: grp("sfx"), score1: 7, score2: 3 },
  { id: "b2", stage: "group", phaseLabel: "Poule B", matchday: 1, date: "2026-07-10", time: "18:30", stadium: S2, side1: grp("nab"), side2: grp("biz"), score1: 5, score2: 4 },
  // Poule A · J2
  { id: "a3", stage: "group", phaseLabel: "Poule A", matchday: 2, date: "2026-07-11", time: "17:00", stadium: S1, side1: grp("ham"), side2: grp("djb"), score1: 5, score2: 1 },
  { id: "a4", stage: "group", phaseLabel: "Poule A", matchday: 2, date: "2026-07-11", time: "18:30", stadium: S1, side1: grp("sah"), side2: grp("krk"), score1: 3, score2: 0, forfeit: true },
  // Poule B · J2
  { id: "b3", stage: "group", phaseLabel: "Poule B", matchday: 2, date: "2026-07-11", time: "17:00", stadium: S2, side1: grp("tun"), side2: grp("biz"), score1: 6, score2: 2 },
  { id: "b4", stage: "group", phaseLabel: "Poule B", matchday: 2, date: "2026-07-11", time: "18:30", stadium: S2, side1: grp("nab"), side2: grp("sfx"), score1: 4, score2: 1 },
  // Poule A · J3
  { id: "a5", stage: "group", phaseLabel: "Poule A", matchday: 3, date: "2026-07-12", time: "17:00", stadium: S1, side1: grp("ham"), side2: grp("sah"), score1: 4, score2: 2 },
  { id: "a6", stage: "group", phaseLabel: "Poule A", matchday: 3, date: "2026-07-12", time: "18:30", stadium: S1, side1: grp("djb"), side2: grp("krk"), score1: 3, score2: 2 },
  // Poule B · J3
  { id: "b5", stage: "group", phaseLabel: "Poule B", matchday: 3, date: "2026-07-12", time: "17:00", stadium: S2, side1: grp("tun"), side2: grp("nab"), score1: 3, score2: 2 },
  { id: "b6", stage: "group", phaseLabel: "Poule B", matchday: 3, date: "2026-07-12", time: "18:30", stadium: S2, side1: grp("biz"), side2: grp("sfx"), score1: 4, score2: 3 },
  // Demi-finales (13/07)
  { id: "sf1", stage: "semi", phaseLabel: "Demi-finale 1", date: "2026-07-13", time: "18:00", stadium: S1, side1: qual("ham", "1ᵉʳ Poule A"), side2: qual("nab", "2ᵉ Poule B"), score1: 4, score2: 2 },
  { id: "sf2", stage: "semi", phaseLabel: "Demi-finale 2", date: "2026-07-13", time: "20:00", stadium: S1, side1: qual("tun", "1ᵉʳ Poule B"), side2: qual("sah", "2ᵉ Poule A"), score1: 5, score2: 3 },
  // 3ᵉ place + Finale (14/07)
  { id: "tp", stage: "third", phaseLabel: "Match pour la 3ᵉ place", date: "2026-07-14", time: "17:00", stadium: S1, side1: loseOf("nab", "sf1", "Perdant Demi-finale 1"), side2: loseOf("sah", "sf2", "Perdant Demi-finale 2"), score1: 4, score2: 3 },
  { id: "fin", stage: "final", phaseLabel: "Finale", date: "2026-07-14", time: "20:00", stadium: S1, side1: winOf("ham", "sf1", "Vainqueur Demi-finale 1"), side2: winOf("tun", "sf2", "Vainqueur Demi-finale 2"), score1: 3, score2: 2 },
]
const rawById = new Map(RAW.map((m) => [m.id, m]))

/** Classement phase navigation. */
export const phases = [
  { id: "groups", name: "Phase de poules" },
  { id: "finals", name: "Phase finale" },
] as const

// ═══════════════════════════════════════════════════════════════════════════
//  Time model + derived view (everything below is COMPUTED).
// ═══════════════════════════════════════════════════════════════════════════

const NOW_BY_STATE: Record<PublicStatus, string> = {
  upcoming: "2026-07-09T12:00:00",
  active: "2026-07-13T19:00:00", // Demi-finale 1 jouée (18:00), Demi-finale 2 (20:00) à venir
  completed: "2026-07-15T12:00:00",
}
const LAST_GROUP = new Date("2026-07-12T18:30:00").getTime()

export function parseStatus(raw: string | null | undefined): PublicStatus | null {
  return raw === "upcoming" || raw === "active" || raw === "completed" ? raw : null
}
export const resolveStatus = (raw: string | null | undefined): PublicStatus => parseStatus(raw) ?? "active"
export const nowFor = (status: PublicStatus): number => new Date(NOW_BY_STATE[status]).getTime()
const matchTime = (m: RawMatch) => new Date(`${m.date}T${m.time}:00`).getTime()
const isPlayed = (m: RawMatch, now: number) => matchTime(m) <= now
const groupsDone = (now: number) => now >= LAST_GROUP

export type SideView = { kind: "team"; team: PublicTeam } | { kind: "tbd"; label: string }

export interface MatchView {
  id: string
  stage: MatchStage
  phaseLabel: string
  matchday?: number
  date: string
  time: string
  stadium: string
  played: boolean
  side1: SideView
  side2: SideView
  score1: number
  score2: number
  forfeit: boolean
  winner: 1 | 2 | null
}

export type EventType = "goal" | "yellow" | "red"
export interface MatchEvent {
  minute: number
  type: EventType
  side: 1 | 2
  teamId: string
  player: string
  assist?: string
}

export interface MatchDetail extends MatchView {
  events: MatchEvent[]
}

export interface StandingRow {
  team: PublicTeam
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
  qualified: boolean
}
export interface PoolView {
  name: string
  rows: StandingRow[]
}

function sideKnown(dep: SideDep, now: number): boolean {
  if (dep.kind === "always") return true
  if (dep.kind === "groups") return groupsDone(now)
  const src = rawById.get(dep.matchId)
  return !!src && isPlayed(src, now)
}
function side(raw: RawSide, now: number): SideView {
  const team = teamById.get(raw.teamId)
  if (team && sideKnown(raw.dep, now)) return { kind: "team", team }
  return { kind: "tbd", label: raw.placeholder || "À déterminer" }
}
function winnerOf(m: RawMatch): 1 | 2 | null {
  if (m.score1 > m.score2) return 1
  if (m.score2 > m.score1) return 2
  return null
}
function toView(m: RawMatch, now: number): MatchView {
  const played = isPlayed(m, now)
  return {
    id: m.id,
    stage: m.stage,
    phaseLabel: m.phaseLabel,
    matchday: m.matchday,
    date: m.date,
    time: m.time,
    stadium: m.stadium,
    played,
    side1: side(m.side1, now),
    side2: side(m.side2, now),
    score1: m.score1,
    score2: m.score2,
    forfeit: !!m.forfeit,
    winner: played ? winnerOf(m) : null,
  }
}

function computeStandings(poolName: string, now: number): StandingRow[] {
  const poolTeams = teams.filter((t) => t.pool === poolName)
  const rows = new Map<string, StandingRow>(
    poolTeams.map((t) => [
      t.id,
      { team: t, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0, qualified: false },
    ]),
  )
  for (const m of RAW) {
    if (m.stage !== "group" || m.phaseLabel !== poolName || !isPlayed(m, now)) continue
    const a = rows.get(m.side1.teamId)
    const b = rows.get(m.side2.teamId)
    if (!a || !b) continue
    a.played++
    b.played++
    a.goalsFor += m.score1
    a.goalsAgainst += m.score2
    b.goalsFor += m.score2
    b.goalsAgainst += m.score1
    if (m.score1 > m.score2) {
      a.won++
      b.lost++
      a.points += 3
    } else if (m.score2 > m.score1) {
      b.won++
      a.lost++
      b.points += 3
    } else {
      a.drawn++
      b.drawn++
      a.points += 1
      b.points += 1
    }
  }
  const list = [...rows.values()]
  for (const r of list) r.goalDiff = r.goalsFor - r.goalsAgainst
  list.sort((x, y) => y.points - x.points || y.goalDiff - x.goalDiff || y.goalsFor - x.goalsFor)
  list.forEach((r, i) => (r.qualified = r.played > 0 && i < 2))
  return list
}

// ── Deterministic goal-timeline generation (no stored events) ────────────────
const hash = (s: string) => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
function goalMinutes(total: number, seed: number): number[] {
  const out: number[] = []
  for (let k = 0; k < total; k++) {
    const base = Math.floor(((k + 0.5) / total) * 36) + 1
    const jitter = ((seed >> (k % 12)) & 3) - 1
    out.push(Math.min(36, Math.max(1, base + jitter)))
  }
  for (let i = 1; i < out.length; i++) if (out[i] <= out[i - 1]) out[i] = Math.min(36, out[i - 1] + 1)
  return out
}
function goalSides(s1: number, s2: number): (1 | 2)[] {
  const res: (1 | 2)[] = []
  let c1 = 0
  let c2 = 0
  for (let k = 0; k < s1 + s2; k++) {
    if (c1 < s1 && (c2 >= s2 || c1 * s2 <= c2 * s1)) {
      res.push(1)
      c1++
    } else {
      res.push(2)
      c2++
    }
  }
  return res
}
function generateEvents(m: RawMatch): MatchEvent[] {
  if (m.forfeit) return [] // walkover — no play
  const seed = hash(m.id)
  const minutes = goalMinutes(m.score1 + m.score2, seed)
  const sides = goalSides(m.score1, m.score2)
  const counters = { 1: 0, 2: 0 }
  const out: MatchEvent[] = sides.map((s, idx) => {
    const teamId = s === 1 ? m.side1.teamId : m.side2.teamId
    const roster = outfield(teamId)
    const gi = counters[s]++
    const scorer = roster[(gi + seed) % roster.length]
    const wantAssist = idx % 2 === 0 && roster.length > 1
    const assist = wantAssist ? roster[(gi + 1 + seed) % roster.length] : undefined
    return { minute: minutes[idx], type: "goal", side: s, teamId, player: scorer.name, assist: assist?.name }
  })
  // One booking for texture.
  if (seed % 2 === 0) {
    const teamId = m.side2.teamId
    const r = outfield(teamId)
    out.push({ minute: Math.min(36, (seed % 18) + 9), type: "yellow", side: 2, teamId, player: r[seed % r.length].name })
  }
  return out.sort((a, b) => a.minute - b.minute || (a.type === "goal" ? -1 : 1))
}

// ── Public view assembly ─────────────────────────────────────────────────────
const dateOf = (iso: string) => iso // already the YYYY-MM-DD portion in our data
const involvesTeam = (v: MatchView, teamId: string) =>
  (v.side1.kind === "team" && v.side1.team.id === teamId) || (v.side2.kind === "team" && v.side2.team.id === teamId)

const byDateDesc = (a: MatchView, b: MatchView) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : a.time < b.time ? 1 : -1
const byDateAsc = (a: MatchView, b: MatchView) =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : a.time < b.time ? -1 : 1

export interface PublicView {
  status: PublicStatus
  todayLabel: string
  today: { results: MatchView[]; upcoming: MatchView[] }
  nextMatch: MatchView | null
  recentResults: MatchView[]
  results: MatchView[]
  upcoming: MatchView[]
  pools: PoolView[]
  bracket: { semis: MatchView[]; third: MatchView | null; final: MatchView | null }
  champion: PublicTeam | null
  runnerUp: PublicTeam | null
  tournamentStarted: boolean
  tournamentFinished: boolean
}

export function getPublicView(status: PublicStatus): PublicView {
  const now = nowFor(status)
  const views = RAW.map((m) => toView(m, now))
  const byId = new Map(views.map((v) => [v.id, v]))

  const results = views.filter((v) => v.played).sort(byDateDesc)
  const upcoming = views.filter((v) => !v.played).sort(byDateAsc)

  const todayIso = NOW_BY_STATE[status].slice(0, 10)
  const todayMatches = views.filter((v) => dateOf(v.date) === todayIso)

  const final = byId.get("fin") ?? null
  const champion = final?.played && final.winner ? sideTeam(final[final.winner === 1 ? "side1" : "side2"]) : null
  const runnerUp = final?.played && final.winner ? sideTeam(final[final.winner === 1 ? "side2" : "side1"]) : null

  return {
    status,
    todayLabel: formatDayLabel(todayIso),
    today: {
      results: todayMatches.filter((v) => v.played).sort(byDateDesc),
      upcoming: todayMatches.filter((v) => !v.played).sort(byDateAsc),
    },
    nextMatch: upcoming[0] ?? null,
    recentResults: results.slice(0, 3),
    results,
    upcoming,
    pools: tournament.pools.map((name) => ({ name, rows: computeStandings(name, now) })),
    bracket: {
      semis: [byId.get("sf1"), byId.get("sf2")].filter((v): v is MatchView => !!v),
      third: byId.get("tp") ?? null,
      final,
    },
    champion,
    runnerUp,
    tournamentStarted: now >= new Date(tournament.startDate + "T00:00:00").getTime(),
    tournamentFinished: !!final?.played,
  }
}

function sideTeam(s: SideView): PublicTeam | null {
  return s.kind === "team" ? s.team : null
}

/** A single match with its generated timeline (for the detail page). */
export function getMatchDetail(matchId: string, status: PublicStatus): MatchDetail | null {
  const raw = rawById.get(matchId)
  if (!raw) return null
  const now = nowFor(status)
  const view = toView(raw, now)
  return { ...view, events: view.played ? generateEvents(raw) : [] }
}

export interface TeamView {
  team: PublicTeam
  roster: PublicPlayer[]
  upcoming: MatchView[]
  results: MatchView[]
  pool: PoolView
}
export function getTeamView(teamId: string, status: PublicStatus): TeamView | null {
  const team = teamById.get(teamId)
  if (!team) return null
  const now = nowFor(status)
  const views = RAW.map((m) => toView(m, now)).filter((v) => involvesTeam(v, teamId))
  return {
    team,
    roster: players.filter((p) => p.teamId === teamId),
    upcoming: views.filter((v) => !v.played).sort(byDateAsc),
    results: views.filter((v) => v.played).sort(byDateDesc),
    pool: { name: team.pool, rows: computeStandings(team.pool, now) },
  }
}

// ── Presentation helpers (French) ─────────────────────────────────────────────
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function formatDayLabel(iso: string): string {
  return cap(new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }))
}
export function formatDateRange(startIso: string, endIso?: string): string {
  const start = new Date(startIso + "T00:00:00")
  if (!endIso) return cap(start.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }))
  const end = new Date(endIso + "T00:00:00")
  const sameMonth = start.getMonth() === end.getMonth()
  const startTxt = start.toLocaleDateString("fr-FR", sameMonth ? { day: "numeric" } : { day: "numeric", month: "long" })
  const endTxt = end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  return `${startTxt} – ${endTxt}`
}
export function groupByDay(views: MatchView[]): { date: string; label: string; matches: MatchView[] }[] {
  const out: { date: string; label: string; matches: MatchView[] }[] = []
  for (const v of views) {
    let bucket = out.find((g) => g.date === v.date)
    if (!bucket) {
      bucket = { date: v.date, label: formatDayLabel(v.date), matches: [] }
      out.push(bucket)
    }
    bucket.matches.push(v)
  }
  return out
}
