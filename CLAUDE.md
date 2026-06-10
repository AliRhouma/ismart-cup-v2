# iSmart-Cup — Prototype (CLAUDE.md)

## Start of every session — READ THESE FIRST
Before writing or editing ANY code, read in this order:
1. This file (CLAUDE.md) — architecture, conventions, and the recipe.
2. `.claude/skills/ismartcup-design-system/SKILL.md` — the visual design system.
3. `src/styles/index.css` — the design tokens (the actual colors, radii, shadows,
   fonts you are allowed to use).
Design and architect from these files, never from memory. If you skipped them,
stop and read them.

## What this project is
A **clickable prototype** of the iSmart-Cup (iSmart Roadcup) tournament-management
platform. Its only job is to demonstrate **screens, navigation, and flows** — how
pages look, how you move between them, how modals/sheets appear, and how
add/create/update/remove *feel* to use.

**There is NO backend.** No API calls, no `fetch`, no endpoints, no auth server.
All data lives in memory (Zustand stores) seeded from JSON. CRUD mutates the
store so it persists across navigation and looks real. If a task seems to need a
server, fake it in the store instead.

## Stack
- Vite + React + TypeScript
- React Router v7 (nested routes)
- Tailwind v4 — tokens in `src/styles/index.css` (DO NOT edit the token values)
- shadcn/ui (themed automatically by the tokens above)
- zustand (state), nanoid (ids), sonner (toasts), lucide-react (icons)

## Design system — non-negotiable
Follow the **`ismartcup-design-system` skill** for all visual work. It is the
LIGHT blue/gold tournament theme (slate-neutral shadcn, Poppins type), NOT the
dark iSmart Coach theme.
- Use semantic Tailwind utilities only: `bg-card`, `bg-surface`, `text-ink`,
  `text-ink-muted`, `border-border`, `bg-brand-600`, `text-success-700`,
  `bg-warning-50`, etc. **Never hardcode hex colors. Never add new fonts.**
- Font: Poppins (Arabic content: Noto Sans Arabic, `lang="ar"`, RTL).
- Light and dark both work via `[data-theme]`; don't break either.

## When the design system does NOT specify something
If asked for a component, page, or layout that the skill does not explicitly
define, do NOT invent a fresh style. First open 2-3 of the CLOSEST existing
pages/components in `features/` and `components/kit/` and study their spacing,
color usage, radii, typography, density, and structure. Then produce something
that feels like it belongs to the same family. Match the existing sense and
feeling - consistency beats novelty. State which existing screens you used as
reference.

## Think UX every time
For every new feature, page, component, or flow, reason about the user experience
before and while building:
- Who uses this and what are they trying to get done here? What is the ONE
  primary action - and is it the most obvious thing on screen?
- Handle the real states: empty, loading, invalid/error, success, and "lots of
  data." Never ship a screen that only handles the happy path.
- Give feedback: toasts on success, disabled/loading buttons, confirmation before
  destructive actions, helpful (not scary) validation messages.
- Keep navigation predictable: always a way back, no dead ends, sensible defaults.
When you present the result, state in one line the key UX decision you made.

## Directory map
```
src/
  app/        router.tsx, providers.tsx
  styles/     index.css          # design tokens - read-only for values
  lib/        utils.ts           # cn(), formatters, fakeDelay()
  data/       types.ts, seed/*.json
  stores/     use<Domain>.ts     # one store per domain
  components/
    ui/       shadcn primitives
    kit/      reusable app widgets (build once, reuse everywhere)
  features/
    tournaments/                 # list + create
    workspace/
      WorkspaceLayout.tsx        # header + tab bar + <Outlet/>
      tabs/                      # one file per tab (Tirage, Equipes, ...)
```

## Conventions
- TypeScript everywhere. Every domain entity has an `id: string`.
- Keep files small and single-purpose so they're cheap to read/edit.
- **Reuse `components/kit/` - do not reinvent** tables, forms, modals, badges,
  avatars, empty states. If a primitive is missing, add it to `kit/` once.
- Navigation = real nested routes. Tabs are child routes under
  `/tournaments/:id` rendered via `<Outlet/>`. URLs must be deep-linkable.
- Modals: local `useState` + shadcn `Dialog` (forms) / `Sheet` (side panels) /
  shared `ConfirmDialog` (destructive). No global modal system.

## Data & CRUD pattern (the "looks real" part)
- Seed data in `src/data/seed/*.json`, typed by `src/data/types.ts`.
- One Zustand store per domain with `add` / `update` / `remove`:
  - `add`: `{ ...input, id: nanoid() }` pushed to the array.
  - `update`: map + spread patch.  `remove`: filter (behind `ConfirmDialog`).
- Fire a `sonner` toast on success. Optional `await fakeDelay(300-500)` + skeleton
  to mimic latency. Optional zustand `persist` so creates survive refresh.

## RECIPE - adding a new page/feature (in order)
1. Add/extend the entity type in `src/data/types.ts`.
2. Add `src/data/seed/<domain>.json` with 3-6 realistic rows.
3. Create `src/stores/use<Domain>.ts` by copying an existing store.
4. Create the page in `features/.../tabs/<Name>.tsx`, composing from `kit/`.
5. Register the route in `src/app/router.tsx` and add the tab to the tab bar.
Read ONE existing store + ONE existing tab as the template before writing new
ones. Do not scan the whole repo.

## Do NOT
- Add `fetch`, axios, API clients, env vars, or any network call.
- Edit token VALUES in `index.css` (you may add new semantic utilities only).
- Introduce new color hex values or fonts outside the design system.
- Build heavy abstractions (no TanStack Query, no Redux). Zustand is enough.
- Reinvent a widget that already exists in `components/kit/`.