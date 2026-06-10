# iSmart-Cup — Design Tokens

The single source of truth is `assets/tokens.css` (Tailwind v4 `@theme inline`). Drop that file
into the project's global stylesheet and every utility below resolves automatically. This file
documents what each token means and which Tailwind utility consumes it, so you pick the right one.

**Never hardcode hex values in components.** Always reference a token via its Tailwind class
(`bg-brand-500`, `text-ink-muted`, `border-border`). That is what keeps light/dark theming working —
the `[data-theme="dark"]` block in `tokens.css` re-points every variable, so a correctly-tokened
component themes for free.

---

## Fonts

- **Poppins** — primary UI font (`font-poppins`, also the `:root` default). All headings and body.
- **Mulish / Roboto / Bebas Neue** — available via `font-mulish`, `font-roboto`, `font-bebas`. Bebas is display-only (rare).
- **Noto Sans Arabic** — auto-applied to `[lang="ar"]` with line-height 1.7. Use for any Arabic / RTL screen.
- Headings get `font-semibold tracking-tight text-ink` from the base layer automatically.

Weights in play: 400 (body), 500 (labels, nav, tabs), 600 (headings, buttons), 700 (big numbers / display).

---

## Color tokens

### Brand (primary blue) — `brand-50 … brand-900`, `brand-foreground`
The product's spine. Buttons, active nav/tabs, links, progress fills, focus rings.
- Solid actions: `bg-brand-500` base, `bg-brand-600` for the heavier "filled" buttons seen in the UI (Ajouter, Gérer, Compris). Hover one step up.
- Tints: `bg-brand-50` / `bg-brand-100` for active-nav pills, icon containers, selected states.
- Text on brand: `text-brand-foreground` (white). Brand-colored text on light: `text-brand-600` / `text-brand-700`.
- `--ring` = brand-500 → focus ring + `shadow-focus`.

### Accent (gold) — `accent2-50/100/500/600/700`, `accent2-foreground`
Favorites, trophies, "highlight note" callouts (the amber box in the favorites modal). Sparing use — it signals reward/attention, not general info.

### Neutrals (slate) — `neutral-50 … neutral-900`
Borders, dividers, muted backgrounds, zebra rows, disabled. The whole UI's quiet scaffolding.

### Surfaces & Ink (use these for layout, not raw neutrals)
- `bg-surface` (#fff) — cards, popovers, inputs.
- `bg-surface-subtle` (#f8fafc) — the page background. This is `bg-background` too.
- `bg-surface-muted` (#f1f5f9) — table headers, zebra rows, segmented-control tracks.
- `bg-surface-raised` — dialogs, dropdown menus, sheets.
- `text-ink` — primary text. `text-ink-subtle` — secondary. `text-ink-muted` — tertiary / placeholders / labels. `text-ink-inverted` — text on dark/brand fills.

### Status — each has `-50` (soft bg), `-500` (solid), `-600/700` (text/hover), `-foreground`
- `success` (green) — "Actif", positive counts, confirmations.
- `warning` (amber) — "Forfait" (withdraw) actions, cautions.
- `danger` (red) — delete, destructive, "Déconnexion". `bg-destructive` / `text-destructive` are aliases.
- `info` (sky blue) — informational notices (distinct from brand).

### shadcn semantic aliases (if using shadcn/ui)
`background, foreground, card, card-foreground, popover, primary, secondary, muted, accent, destructive, border, input, ring` — all mapped to the tokens above. shadcn components work out of the box.

---

## Radii — corners are generous and soft
- `rounded-xs` 4px · `rounded-sm` 6px · `rounded-md` 8px · `rounded` 10px · `rounded-lg` 12px · `rounded-xl` 16px · `rounded-2xl` 20px.
- **Defaults in this UI:** buttons & inputs `rounded-lg`; cards `rounded-xl`/`rounded-2xl`; modals `rounded-2xl`; pills/badges/search/nav-pills/avatars `rounded-full`.

## Shadows — soft, low-contrast elevation
`shadow-xs → shadow-xl`. Cards sit at `shadow-sm`; raised menus/dropdowns at `shadow-md`/`shadow-lg`; modals at `shadow-xl`. `shadow-focus` is the brand focus glow. Never use harsh/black shadows — these are tuned slate-tinted.

---

## Dark theme
Add `data-theme="dark"` to `<html>` (or any ancestor). `tokens.css` re-points every variable to a
shadcn-style slate palette (page `#0a0b10`, cards `#13151b`, brighter brand for readable text on dark).
Because components reference tokens, **nothing in component code changes** — that's the entire point.
Wire a `ThemeProvider` that toggles the attribute; the segmented sun/moon control (see components.md)
is the canonical switch.

## Spacing & layout rhythm
- Page container: `.container` (max 1400px, responsive horizontal padding) — already in tokens.css.
- Card padding: `p-5` to `p-6`. Section gaps: `gap-6`. Card-grid gaps: `gap-4`/`gap-6`.
- Stat-card grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Content-card grids: `lg:grid-cols-3`.