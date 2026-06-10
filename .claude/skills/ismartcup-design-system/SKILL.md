---
name: ismartcup-design-system
description: Apply the iSmart-Cup design system when building any page, component, section, or visual interface for the iSmart-Cup (iSmart Roadcup) tournament-management platform. Triggers whenever the user asks to build, mock up, or extend an iSmart-Cup screen — tournament list, tournament workspace (Aperçu, Tableau de bord, Paramètres, Sponsors, Équipes, Tirage, Calendrier, Résultats, Arbitres, Récompenses), data tables, KPI dashboards, registration forms, team cards, standings, modals, or settings panels. Also use when the user says "use the iSmart-Cup style", "match the tournament app", "iSmart-Cup theme", "on-brand", or references the light blue/gold sports-tournament aesthetic with the slate-neutral shadcn palette and Poppins type. Use this skill for any new iSmart-Cup page or React component — even a quick prototype — so it stays on-brand. Note this is the LIGHT blue/gold tournament product, distinct from the dark neon-green iSmart Coach skill.
---

# iSmart-Cup Design System

A clean, light, professional design system for the iSmart-Cup tournament-management web app: **brand
blue** primary, **gold** accent for favorites/rewards, **slate** neutrals, soft rounded surfaces,
Poppins type, full light + dark theming, and Arabic/RTL support. Built on Tailwind v4 tokens
(shadcn-compatible). Staying on-brand is the whole job — so consult this skill for every iSmart-Cup
screen or component, not just big ones.

## Start here, every time

1. **Install the tokens.** Ensure `assets/tokens.css` is imported into the project's global stylesheet
   (it's the source of truth — Tailwind v4 `@theme inline`, light + dark themes). If the user has no
   project yet or is building a standalone artifact, inline its `:root` / `[data-theme="dark"]` blocks.
   Every utility class below depends on it.
2. **Read the reference you need** (don't guess token values or component markup from memory):
   - `references/tokens.md` — colors, fonts, radii, shadows, dark theme, spacing rhythm. Read before choosing any color or size.
   - `references/components.md` — copy-adaptable recipes for buttons, badges, cards, inputs, tabs, sidebar nav, data tables, avatars, progress/stepper, modals, dropdowns, empty states, segmented controls.
   - `references/patterns.md` — the two app shells and how full pages (overview, dashboard, teams, settings) compose. Read when building a whole page or layout.
3. **Build with tokens, never hex.** Use `bg-brand-600`, `text-ink-muted`, `border-border`, etc.
   Correctly-tokened components theme for light/dark automatically — that's the point. Hardcoded
   hex breaks theming and is off-brand.

## The look in one paragraph

Page background is `surface-subtle` (near-white slate). Content lives on white `surface` cards with
quiet `border-border`, soft `shadow-sm`, and generous `rounded-xl`/`rounded-2xl` corners. Primary
actions are solid `brand-600` buttons; everything else is outline or ghost. Active nav and tabs are
`brand-50` pills with `brand-600` text. Status is color-coded with soft-bg pills (green Actif, grey
Terminé, amber Forfait, red destructive). Gold (`accent2`) is reserved for favorites and trophies. A
recurring **icon chip** — `size-10 rounded-lg bg-brand-50 text-brand-600` — heads titled sections.
Type is Poppins; headings are `font-semibold tracking-tight text-ink`; the text hierarchy is
`ink → ink-subtle → ink-muted`. The overall feel is airy, restrained, and trustworthy — color is
earned, not sprinkled.

## Non-negotiables (what keeps it on-brand)

- **Brand blue = primary action only.** One or two decisive blue buttons per view. Don't paint
  whole surfaces brand.
- **Status colors mean status.** Green/amber/red/sky only for states, never decoration.
- **Soft elevation.** `shadow-sm` on cards, `shadow-lg` on menus, `shadow-xl` on modals. Never harsh black shadows.
- **Rounded and roomy.** Buttons/inputs `rounded-lg`; cards `rounded-xl`+; pills/avatars/search `rounded-full`. Card padding `p-5`/`p-6`.
- **Text on tokens.** `text-ink` / `-subtle` / `-muted` — don't reach for raw `text-gray-*`.
- **Page header convention.** `text-2xl font-semibold tracking-tight` title + optional muted subtitle, primary action pinned right on the same row.

## Output format

- **React component / page** → produce a self-contained `.jsx`/`.tsx` artifact using Tailwind classes
  and `lucide-react` icons, matching the recipes in `components.md`. Default export, no required props.
- **HTML mockup** → single `.html` with `tokens.css` inlined in a `<style>` block.
- When the user names a specific screen (e.g. "the Équipes table", "the favorites modal"), follow the
  exact composition in `patterns.md` / `components.md` for that screen.
- French is the product's primary UI language; keep French labels unless the user asks otherwise.
  For Arabic, set `dir="rtl"` and prefer logical utilities (`ps-`, `me-`, `start-`) — see `patterns.md`.

## Frontend craft

For anything beyond a trivial snippet, also follow the general `frontend-design` skill
(`/mnt/skills/public/frontend-design/SKILL.md`) for layout polish and code quality — this skill governs
the *brand*, that one governs *build quality*. They compose.