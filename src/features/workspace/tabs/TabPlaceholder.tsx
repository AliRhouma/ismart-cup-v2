import { Construction } from "lucide-react"

/** Stand-in for a workspace tab until the real screen is built. */
export default function TabPlaceholder({ label }: { label: string }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">{label}</h2>
        <p className="mt-1 text-sm text-ink-muted">Cette section sera bientôt disponible.</p>
      </div>

      <div className="grid place-items-center rounded-xl border border-dashed border-border bg-surface p-12 text-center shadow-sm">
        <span className="mb-3 grid size-12 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Construction className="size-6" />
        </span>
        <p className="font-medium text-ink">« {label} » — écran à venir</p>
        <p className="mt-1 max-w-sm text-sm text-ink-muted">
          Le cadre de navigation est en place ; le contenu de cet onglet sera ajouté ensuite.
        </p>
      </div>
    </div>
  )
}
