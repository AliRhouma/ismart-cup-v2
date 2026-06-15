# iSmart-Cup — UI/UX Prototype (CLAUDE.md)

This is a **prototype, not a real app.** Goal: screens that look exactly like the iSmart-Cup
product, navigate between each other, **and behave like real data** — add / edit / delete
persist across screens and ripple into other views. **No backend and no network:** all data
lives in a single in-memory store, seeded on load. A designer is delivering this to demo
look-and-feel, flow, and core interactions.

## TIER 1 — Hard rules
- **Design-first.** Every screen/component uses the `ismartcup-design-system` skill in `.claude/skills/`. Read it before building anything. Match it exactly.
- **Prefer tokens over hex.** Use `bg-brand-600`, `text-ink-muted`, `border-border`, etc. from `src/styles/tokens.css`. Raw hex is allowed only when no token fits — leave a comment explaining why.
- **In-memory data.** A single React Context store at the app root holds all data, seeded on load from `src/mock/data.ts`. Screens read from it and mutate via add / update / remove, so create/edit/delete persist across navigation and show up in other screens. No fetch, no API, no async, no server, no runtime schemas. In memory only — resets on refresh.
- **No real business logic.** Only simple add/edit/delete and derived display values (standings, "X/Y inscrites", counts). Do NOT implement the tournament engine — no bracket generation, scheduling, or scoring rules.
- **Everything navigates.** Buttons, tabs, cards, back arrows route to real screens. The demo must feel clickable end to end. Use placeholder screens for anything not built yet, never dead buttons.
- **Routes, not tab state.** Top-level tabs/screens are nested React Router routes (one URL each). Global data lives in the store; only in-screen UI (open modals, form inputs, filters) uses local state.
- **No over-engineering.** The store is a plain React Context + `useReducer`/`useState` — NOT a library; new-row IDs use the built-in `crypto.randomUUID()`. Don't add redundant infrastructure (Zustand, Redux, TanStack Query, Zod, MSW, react-hook-form, shadcn) unless I ask. Real capability libraries (charts, drag-and-drop, canvas, etc.) are fine when a screen genuinely needs one — see Stack.

## TIER 2 — Craft: think UX & creativity on every screen
Before building any screen or component, think like a designer, not a code generator:
- **Purpose first.** Who is on this screen and what is the ONE thing they came to do? Make that primary action the most obvious element; everything else is secondary and visually quieter.
- **Make it feel alive.** Seed varied, believable French content — different team names, a mix of statuses (Terminé / Programmé / En cours), a forfeit, a long name, a near-full and an empty tournament. Identical rows look fake; variety looks real.
- **Design every state, not just the happy one.** Think through the empty state, the "lots of data" state, and the selected/active state. A thoughtful empty card ("Aucun sponsor pour l'instant") sells the prototype more than a full one. (Empty states now also appear after a user deletes everything — handle that.)
- **Interactions must respond.** Hover, active tab, selected row, pressed button, and visible feedback on actions (a brief inline/toast-style confirmation). Clicking should always *feel* like something happened.
- **Hierarchy & rhythm.** Most important info biggest and first; supporting info muted (`text-ink-muted`). Keep a consistent spacing rhythm and let screens breathe.
- **Creative WITHIN the system.** The design-system skill is the ceiling for style — never invent a new palette, font, or foreign look. (Rare one-off hex per the Tier 1 rule is fine; a new color *system* is not.) Creativity means thoughtful composition, good empty-state ideas, and smart use of the existing tokens and components.
- **When the system doesn't define something,** don't guess randomly: open 2-3 of the closest existing screens/components, study their spacing, density, and feeling, and extend that. A new screen must look like it belongs to the same family. State which screens you referenced.
- **Tasteful restraint.** Polish with intent (an icon, a status dot, a progress bar) — don't over-decorate. Clean and considered beats busy.

End each screen by stating, in one line, the main UX/creative decision you made.

## Stack (keep it minimal)
- Vite + React + TypeScript.
- Tailwind v4 (tokens via `src/styles/tokens.css`) + `lucide-react` icons.
- React Router for screen navigation. React Context for the in-memory data store.

If I ask for something this stack can't cleanly do (drag-and-drop, interactive
canvas, charts, virtualization, complex animations, etc.), don't get stuck on
the list — read the use case, pick the best-fit library for the job, install
it, and use it. The "minimal" rule is about avoiding bloat (UI kits,
convenience libs, redundant state managers), not about refusing real
capability needs.

## Data layer (in-memory store)
- One provider, `src/data/DataProvider.tsx`, mounted at the app root (wraps the router). It loads `src/mock/data.ts` into state on first render.
- It exposes the collections (tournaments, teams, matches, referees, stadiums, sponsors, …) plus per-entity actions: `addTeam` / `updateTeam` / `removeTeam`, and the same shape for the others.
- Screens read and mutate through a `useData()` hook — never import `mock/data.ts` directly.
- New rows get `crypto.randomUUID()` ids. Existing seed rows keep readable slug ids (`team-psg`).
- Derived values (standings, "X/Y inscrites", player counts) are COMPUTED from the store in render — never stored.
- In memory only; state resets on page refresh. (If I ask, persistence can later be added via `localStorage` — not now.)

## Reference docs (/docs)
- `docs/schema.prisma` — the REAL backend schema. **Reference only.** Never copy it into the app. When the data needs a field, look up its real name / relationship here.
- `docs/data-plan.md` — the prototype data slice: the ~11 entities and only the fields the screens show. **The types and the seed in `src/mock/data.ts` follow this file.**

Data rules:
- Use the real field names from `docs/data-plan.md`. IDs are strings. Every entity except Tournament carries `tournamentId`.
- Do NOT model the backend engine (Phase / Component / TeamSlot / Criteria / Pot / MatchTie). A match just holds `team1Id` / `team2Id`, or a placeholder string ("Vainqueur Match 3") when teams aren't decided yet.
- Read `docs/data-plan.md` before editing `src/mock/data.ts`, the store, or any screen that shows data. Add a field only when a screen needs it, taking it from `docs/schema.prisma`.

## Structure (flat, screen-based)
```
docs/
  schema.prisma             # real backend — reference only
  data-plan.md              # prototype data slice (shapes for the store + seed)
src/
  main.tsx  App.tsx            # App.tsx = <DataProvider> wrapping the router
  styles/index.css            # @import "./tokens.css"
  data/
    DataProvider.tsx          # app-root Context store, seeded from mock/data.ts; add/update/remove
    useData.ts                # useData() hook screens call to read + mutate
  mock/data.ts                # SEED data (initial values), shaped per docs/data-plan.md
  shells/
    AppShell.tsx              # sidebar + topbar (tournaments list level)
    TournamentShell.tsx       # back-header + tab bar (inside a tournament)
  components/                 # shared UI from the skill (Avatar, StatusBadge, Card, ProgressBar, EmptyState, DataTable, Modal, Tabs…)
  screens/
    TournamentsList.tsx
    tournament/
      Overview.tsx  Dashboard.tsx  Settings.tsx  Sponsors.tsx
      Teams.tsx  Draw.tsx  Calendar.tsx  Results.tsx
      Referees.tsx  Rewards.tsx  Favorites.tsx
    Templates.tsx  CalendarGlobal.tsx
```

## Conventions
- French UI strings (it's the product language).
- Reuse shared components from `components/` — don't re-style the same thing twice.
- Screens read and mutate data only through `useData()`. `src/mock/data.ts` is the seed and the single source of truth for initial content (same 12 teams everywhere, etc.).
- Empty states where they make the demo look real (an empty "Actualités" card; an emptied list after deletes). No spinners faking network calls.
- Light/dark theme toggle is a nice-to-have via `data-theme` on `<html>` (tokens already support it).

## Autonomy
- Run any terminal/bash command you need on your own — install deps, start/stop the dev server, build, typecheck, run git, move or rename files, run scripts. **Don't pause to ask for permission; just run it and keep building.** Call out only the notable ones (a new dependency added, or anything destructive).

## Commands
- `pnpm dev` · `pnpm build` · `pnpm typecheck`

## Workflow
- Build screen by screen, on-brand, wired into the router and the store as you go. Show me each screen as it lands.