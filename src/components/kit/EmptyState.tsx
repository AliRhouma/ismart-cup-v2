import type { ReactNode } from "react"
import { Inbox, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  message: string
  /** Optional call-to-action (e.g. a "+ Ajouter" button). */
  action?: ReactNode
  className?: string
}

/** Centered neutral icon chip + muted copy — design system §11 (Empty states). */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-full bg-neutral-100 text-ink-muted">
        <Icon className="size-5" />
      </span>
      {title && <p className="mt-3 font-medium text-ink">{title}</p>}
      <p className={cn("text-sm text-ink-muted", title ? "mt-1" : "mt-3")}>{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
