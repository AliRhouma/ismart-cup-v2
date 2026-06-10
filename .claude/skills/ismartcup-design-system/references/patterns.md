# iSmart-Cup — Layout & Page Patterns

How the components assemble into the actual screens. Two app shells dominate the product.

## Shell A — App shell (list/management level)
Fixed left sidebar + top bar + scrollable content. Used by "Mes Tournois", Calendrier, Modèles.

```jsx
<div className="flex min-h-screen bg-surface-subtle">
  {/* Sidebar */}
  <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
    <div className="flex h-16 items-center gap-2 px-5 font-bold text-ink">{/* iSMART-CUP logo */}</div>
    <nav className="flex flex-col gap-1 px-3 py-2">{/* nav items — components.md §5 */}</nav>
  </aside>
  {/* Main column */}
  <div className="flex min-w-0 flex-1 flex-col">
    <header className="flex h-16 items-center gap-4 border-b border-border bg-surface px-6">
      <div className="flex-1 max-w-2xl">{/* pill search — components.md §4 */}</div>
      <div className="ml-auto flex items-center gap-3">{/* lang · bell · avatar dropdown */}</div>
    </header>
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Mes Tournois</h1>
        <button className="…primary…">+ Ajouter</button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{/* tournament cards */}</div>
    </main>
  </div>
</div>
```

**Tournament card** (the list grid item):
```jsx
<div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
  <div className="flex items-start justify-between">
    <h3 className="font-semibold text-ink">Final Tournament</h3>
    <span className="… bg-neutral-100 text-neutral-600">Terminé</span>
  </div>
  <p className="mt-1 text-sm text-ink-muted">Début: 27/05/2025</p>
  <div className="mt-4">
    <div className="mb-1.5 flex justify-between text-sm"><span className="text-ink-subtle">Inscription des équipes</span><span className="font-medium text-ink">4/4</span></div>
    {/* progress bar — components.md §8 */}
  </div>
  <div className="mt-4 flex gap-3">
    <button className="flex-1 …outline…">Modifier</button>
    <button className="flex-1 …primary…">Gérer ›</button>
  </div>
</div>
```

## Shell B — Tournament workspace (detail level)
Back-header with title + tab bar, then tab content. Used by Aperçu, Tableau de bord, Paramètres, Équipes, etc.

```jsx
<div className="min-h-screen bg-surface-subtle">
  <header className="border-b border-border bg-surface px-6 pt-4">
    <div className="flex items-center gap-3">
      <button className="grid size-9 place-items-center rounded-lg hover:bg-neutral-100"><ArrowLeft className="size-5" /></button>
      <h1 className="text-xl font-semibold tracking-tight text-ink">Test Tournois AVRIL</h1>
      <div className="ml-auto flex items-center gap-2">{/* bell · qr · kebab */}</div>
    </div>
    {/* tab bar — components.md §5 */}
  </header>
  <main className="p-6">{/* active tab content */}</main>
</div>
```

## Common page compositions

**Overview (Aperçu):** 4 info-cards row (`grid lg:grid-cols-4 gap-6`) → titled "Indicateur de Progression" stepper card → "Actualités" card (empty state if none). Each titled section leads with the brand icon chip.

**Dashboard (Tableau de bord):** page title + status badge → 2 action cards (`lg:grid-cols-2`) → 4 KPI stat cards (`lg:grid-cols-4`) → two side-by-side table panels (`lg:grid-cols-2`).

**Teams (Équipes):** page title + subtitle on the left, primary "+ Nouvelle équipe" on the right → thin summary strip (totals + green active dot) → data table (star-favorite · logo · name · category · date · status · row actions).

**Settings (Paramètres):** page title "Contraintes Globales" + subtitle → stacked section cards, each with its own title+subtitle and a `md:grid-cols-2` form grid → toggle rows for optional features.

## Page header convention
Every page opens with: `text-2xl font-semibold tracking-tight text-ink` title, optional `text-sm text-ink-muted` subtitle below, and the primary action button pinned right on the same row (`flex items-center justify-between`).

## RTL / Arabic
For `lang="ar"` set `dir="rtl"` on the shell; flip `border-r`→`border-l`, `left`→`right` icon positions, and `ml-auto`→`mr-auto`. Noto Sans Arabic + line-height 1.7 apply automatically (tokens.css). Prefer logical utilities (`ps-`/`pe-`, `ms-`/`me-`, `start-`/`end-`) so a single component serves both directions.

## Density & restraint
Light, airy, lots of `bg-surface-subtle` breathing room. Borders are quiet (`border-border`), shadows soft (`shadow-sm`). Color is earned: brand for primary action only, status colors only for status, gold only for favorites/rewards. A screen that is mostly white/slate with a couple of decisive blue actions is on-brand; a screen with five competing accent colors is not.