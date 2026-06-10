import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Run on confirm; may be async. The dialog shows a spinner until it resolves. */
  onConfirm: () => void | Promise<void>
  /** Destructive (red) styling — true by default since this guards deletes. */
  destructive?: boolean
}

/**
 * Confirmation gate for destructive actions (CLAUDE.md: confirm before destroy).
 * Owns its own pending state so the confirm button is disabled + spinning while
 * the async action runs; closes itself on success.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler",
  onConfirm,
  destructive = true,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false)

  async function handleConfirm() {
    try {
      setPending(true)
      await onConfirm()
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span
            className={cn(
              "grid size-12 place-items-center rounded-full",
              destructive
                ? "bg-danger-50 text-danger-600"
                : "bg-brand-50 text-brand-600",
            )}
          >
            <AlertTriangle className="size-6" />
          </span>
          <DialogTitle className="mt-4">{title}</DialogTitle>
          {description && (
            <DialogDescription className="mt-2">{description}</DialogDescription>
          )}
        </div>

        <DialogFooter className="mt-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 font-medium text-ink transition hover:bg-neutral-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={handleConfirm}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
              destructive
                ? "bg-danger-600 text-danger-foreground hover:bg-danger-700"
                : "bg-brand-600 text-brand-foreground hover:bg-brand-700",
            )}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
