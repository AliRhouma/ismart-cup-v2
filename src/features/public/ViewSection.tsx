import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

/** Titled section with the signature brand icon chip — shared by the tab views. */
export default function ViewSection({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h2>
          {subtitle && <p className="truncate text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  )
}
