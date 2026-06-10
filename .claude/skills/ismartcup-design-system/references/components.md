# iSmart-Cup — Component Recipes

Copy-adapt these. Every class references a token from `tokens.css`, so they theme automatically.
Snippets are React/JSX + Tailwind v4. Keep semantics identical when porting to plain HTML.

## Table of contents
1. Buttons
2. Badges & status pills
3. Cards (content, stat, action, info)
4. Inputs, selects, toggles
5. Tabs (tournament header) & sidebar nav
6. Data tables
7. Avatars
8. Progress bar & stepper/timeline
9. Modal / dialog
10. Dropdown menu & popover
11. Empty states
12. Segmented control

---

## 1. Buttons
Shape `rounded-lg`, `font-medium`/`font-semibold`, `px-4 h-10` (sm: `h-9 px-3`), focus → `focus-visible:ring-2 ring-ring ring-offset-2`. Transitions on bg.

```jsx
// Primary (Ajouter, Gérer, Compris, Nouvelle équipe)
<button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 h-10 font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50">
  <Plus className="size-4" /> Ajouter
</button>

// Secondary / outline (Modifier, Joueurs, Configurer maintenant)
<button className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-surface px-4 h-10 font-medium text-brand-700 transition hover:bg-brand-50">
  Modifier
</button>

// Warning outline (Forfait)
<button className="inline-flex items-center gap-2 rounded-lg border border-warning-500 px-3 h-9 text-sm font-medium text-warning-600 transition hover:bg-warning-50">
  <UserMinus className="size-4" /> Forfait
</button>

// Icon buttons — edit (neutral) / delete (danger)
<button className="grid size-9 place-items-center rounded-lg text-ink-muted transition hover:bg-neutral-100 hover:text-ink"><Pencil className="size-4" /></button>
<button className="grid size-9 place-items-center rounded-lg text-danger-500 transition hover:bg-danger-50"><Trash2 className="size-4" /></button>

// Danger text (Déconnexion in menus)
<button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-danger-600 transition hover:bg-danger-50"><LogOut className="size-4" /> Déconnexion</button>
```
Trailing chevron on navigational primaries (`Gérer ›` → add `<ChevronRight className="size-4" />`).

## 2. Badges & status pills
`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`. Soft bg + matching text. Optional leading dot (`<span className="size-1.5 rounded-full bg-current" />`).

```jsx
<span className="... bg-success-50 text-success-700">Actif</span>      {/* green */}
<span className="... bg-neutral-100 text-neutral-600">Terminé</span>   {/* grey */}
<span className="... bg-warning-50 text-warning-700">En attente</span>
<span className="... bg-danger-50 text-danger-600">Forfait</span>
<span className="... bg-brand-50 text-brand-700">À venir</span>
```

## 3. Cards
Base card: `rounded-xl border border-border bg-surface p-6 shadow-sm`. (Use `rounded-2xl` for hero/modal-like cards.)

```jsx
// Content card
<div className="rounded-xl border border-border bg-surface p-6 shadow-sm">…</div>

// Stat card (dashboard KPIs)
<div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
  <p className="text-sm text-ink-muted">Équipes inscrites</p>
  <div className="mt-2 flex items-baseline gap-2">
    <span className="text-4xl font-bold text-ink">12</span>
    <span className="text-sm text-ink-muted">/ 12</span>
  </div>
  {/* optional progress bar — see §8 */}
</div>

// Info card (overview) — icon chip + title + label/value lines
<div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
  <div className="flex items-center gap-3">
    <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-600"><Calendar className="size-5" /></span>
    <h3 className="font-semibold text-ink">Calendrier du Tournoi</h3>
  </div>
  <dl className="mt-4 space-y-1 text-sm">
    <div><span className="font-medium text-ink">Début:</span> <span className="text-ink-subtle">mer. 1 avril 2026</span></div>
  </dl>
</div>

// Action card (dashboard CTAs) — title, description, ghost button with icon
<div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
  <h3 className="font-semibold text-ink">Configurer les contraintes</h3>
  <p className="mt-1 text-sm text-ink-muted">Définissez la durée des matchs…</p>
  <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand-200 px-4 h-9 text-sm font-medium text-brand-700 hover:bg-brand-50"><Settings className="size-4" /> Configurer maintenant <ChevronRight className="size-4" /></button>
</div>
```
The **icon chip** (`size-10 rounded-lg bg-brand-50 text-brand-600`) is a signature element — reuse it for any titled section. Swap the tint to `bg-accent2-100 text-accent2-600` for reward/trophy contexts.

## 4. Inputs, selects, toggles
```jsx
// Labeled input (form grids are grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5)
<label className="block">
  <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nombre de terrains disponibles</span>
  <input className="h-11 w-full rounded-lg border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/30" />
</label>

// Search (pill, leading icon) — top bar
<div className="relative">
  <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
  <input placeholder="Rechercher des tournois" className="h-11 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-ink placeholder:text-ink-muted focus:ring-2 focus:ring-ring/30 focus:outline-none" />
</div>

// Toggle switch (blue when on)
<button role="switch" aria-checked={on} className={`relative h-6 w-11 rounded-full transition ${on ? "bg-brand-500" : "bg-neutral-300"}`}>
  <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${on ? "left-[22px]" : "left-0.5"}`} />
</button>
```

## 5. Tabs & sidebar nav
**Tournament header tabs** — horizontal, icon+label, active = brand-50 pill + brand-600 text:
```jsx
<nav className="flex items-center gap-1 overflow-x-auto border-b border-border pb-px">
  {tabs.map(t => (
    <button key={t.id} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 h-9 text-sm font-medium transition
      ${active===t.id ? "bg-brand-50 text-brand-600" : "text-ink-muted hover:text-ink hover:bg-neutral-100"}`}>
      <t.icon className="size-4" /> {t.label}
    </button>
  ))}
</nav>
```
**Sidebar nav item** — same active language, `rounded-lg`, icon goes brand when active:
```jsx
<a className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition
  ${active ? "bg-brand-50 text-brand-600" : "text-ink-subtle hover:bg-neutral-100"}`}>
  <Trophy className="size-5" /> Tournois
</a>
```

## 6. Data tables
Header `bg-surface-muted`, uppercase tiny labels, rows divided, hover tint, cells `py-4 px-4`.
```jsx
<div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
  <table className="w-full text-sm">
    <thead className="bg-surface-muted">
      <tr className="text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
        <th className="px-4 py-3">Nom de l'équipe</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr className="transition hover:bg-neutral-50">
        <td className="px-4 py-4 font-medium text-ink">Bayern Munich</td>
        <td className="px-4 py-4"><span className="… bg-success-50 text-success-700">Actif</span></td>
        <td className="px-4 py-4 text-right">…actions…</td>
      </tr>
    </tbody>
  </table>
</div>
```
Pair with a thin summary strip above (`Total des Équipes 12 · ● Équipes Actives 12`) using a success dot.

## 7. Avatars
Circular, soft tinted bg + initials; cycle tints per entity. `size-10 rounded-full grid place-items-center text-xs font-semibold`.
```jsx
<span className="grid size-10 place-items-center rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">MC</span>
```
Tint palette to cycle: brand-100/700, accent2-100/600, success-50/600, info-50/600, neutral-200/700, danger-50/600.

## 8. Progress bar & stepper
```jsx
// Progress bar (registration count, KPI fill)
<div className="h-2 w-full rounded-full bg-neutral-200"><div className="h-full rounded-full bg-brand-500" style={{width:`${pct}%`}} /></div>

// Horizontal stepper / phase timeline
<ol className="flex items-center">
  {steps.map((s,i)=>(
    <li key={s.id} className="flex flex-1 items-center">
      <div className="flex flex-col items-center">
        <span className={`grid size-9 place-items-center rounded-full text-sm font-semibold transition
          ${s.done ? "bg-brand-500 text-brand-foreground ring-4 ring-brand-100"
                   : "bg-neutral-100 text-ink-muted"}`}>{i+1}</span>
        <span className={`mt-2 text-xs ${s.done?"font-medium text-brand-600":"text-ink-muted"}`}>{s.label}</span>
      </div>
      {i<steps.length-1 && <span className={`mx-1 h-0.5 flex-1 rounded-full ${s.done?"bg-brand-500":"bg-neutral-200"}`} />}
    </li>
  ))}
</ol>
```

## 9. Modal / dialog
Dim blurred backdrop, centered `rounded-2xl` card, icon-in-circle header, optional amber note, full-width primary, close X.
```jsx
<div className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/40 backdrop-blur-sm p-4">
  <div className="relative w-full max-w-md rounded-2xl bg-surface p-7 text-center shadow-xl">
    <button className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-ink-muted hover:bg-neutral-100"><X className="size-4" /></button>
    <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent2-100 text-accent2-500"><Star className="size-6" /></span>
    <h2 className="mt-4 text-xl font-semibold text-ink">Choisissez votre équipe favorite</h2>
    <p className="mt-2 text-sm text-ink-muted">Appuyez sur l'étoile d'une carte équipe…</p>
    <div className="mt-5 flex items-center gap-2 rounded-lg bg-accent2-50 px-4 py-3 text-sm text-accent2-700"><Star className="size-4 shrink-0" /> Repérez l'étoile sur chaque carte</div>
    <button className="mt-5 w-full rounded-lg bg-brand-600 h-11 font-semibold text-brand-foreground hover:bg-brand-700">Compris</button>
  </div>
</div>
```

## 10. Dropdown menu & popover
Raised white card, `rounded-xl`, `shadow-lg`, item rows with icons; danger items use danger text.
```jsx
<div className="w-64 rounded-xl border border-border bg-surface-raised p-1.5 shadow-lg">
  <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink hover:bg-neutral-100"><Home className="size-4 text-ink-muted" /> Accueil</button>
  {/* embed the segmented sun/moon theme toggle here (see §12) */}
  <div className="my-1 h-px bg-border" />
  <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"><LogOut className="size-4" /> Déconnexion</button>
</div>
```

## 11. Empty states
Centered, neutral icon chip, muted copy. Used in news, notifications, empty tables.
```jsx
<div className="flex flex-col items-center justify-center py-14 text-center">
  <span className="grid size-12 place-items-center rounded-full bg-neutral-100 text-ink-muted"><Bell className="size-5" /></span>
  <p className="mt-3 text-sm text-ink-muted">Aucune notification pour le moment</p>
</div>
```

## 12. Segmented control (theme toggle, Tous/Non lus)
Track `bg-surface-muted rounded-full p-1`; active segment `bg-surface rounded-full shadow-sm`.
```jsx
<div className="inline-flex rounded-full bg-surface-muted p-1">
  {opts.map(o=>(
    <button key={o.id} className={`grid place-items-center rounded-full px-4 h-8 text-sm font-medium transition
      ${active===o.id ? "bg-surface text-ink shadow-sm" : "text-ink-muted"}`}>{o.label}</button>
  ))}
</div>
```