import { useNavigate } from "react-router-dom"
import { ArrowLeft, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PublicStatus } from "./mock"

const PILL: Record<PublicStatus, { label: string; cls: string; dot: string }> = {
  upcoming: { label: "À venir", cls: "bg-brand-50 text-brand-700", dot: "bg-brand-500" },
  active: { label: "En cours", cls: "bg-success-50 text-success-700", dot: "bg-success-500" },
  completed: { label: "Terminé", cls: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
}

/** Minimal sticky header for the public detail pages (match / team). */
export default function DetailHeader({ status }: { status: PublicStatus }) {
  const navigate = useNavigate()
  const pill = PILL[status]
  return (
    <div className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="-ml-2 grid size-9 place-items-center rounded-lg text-ink-muted transition hover:bg-neutral-100 hover:text-ink"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-brand-600 text-brand-foreground">
            <Trophy className="size-4" />
          </span>
          <span className="text-sm font-bold tracking-tight text-ink">
            iSmart<span className="text-brand-600">-Cup</span>
          </span>
        </div>
        <span className={cn("ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", pill.cls)}>
          <span className={cn("size-1.5 rounded-full", pill.dot, status === "active" && "animate-pulse")} />
          {pill.label}
        </span>
      </div>
    </div>
  )
}
