import { ImageIcon, Sparkles } from "lucide-react"

/**
 * Sponsors — an EMPTY placeholder section. Sits above the footer inside the
 * shared layout, so it appears identically on every tab (mobile + web). Shows
 * neutral logo slots and a "become a partner" note rather than faking partners.
 */
export default function SponsorsBand() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Nos partenaires</h2>
            <p className="mt-0.5 text-xs text-ink-muted">L'espace partenaires de cette édition</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent2-50 px-3 py-1 text-xs font-medium text-accent2-700">
            <Sparkles className="size-3.5" /> Devenez partenaire
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border bg-surface-subtle/60 text-ink-muted/50"
            >
              <ImageIcon className="size-6" />
            </div>
          ))}
          <div className="hidden items-center justify-center rounded-xl border border-dashed border-border bg-surface-subtle/60 px-3 text-center text-xs text-ink-muted lg:flex">
            Votre logo ici
          </div>
        </div>
      </div>
    </section>
  )
}
