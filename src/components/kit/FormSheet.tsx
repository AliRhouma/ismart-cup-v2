import { useState, type FormEvent, type ReactNode } from "react"
import { Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** Form fields. */
  children: ReactNode
  /** Submit handler; may be async. Throw to keep the sheet open (e.g. validation). */
  onSubmit: () => void | Promise<void>
  submitLabel?: string
  cancelLabel?: string
  side?: "right" | "left"
}

/**
 * Side-panel wrapper for create/edit forms (CLAUDE.md: Sheet for forms).
 * Renders a real <form> so Enter submits; owns submitting state so the submit
 * button disables + spins, and only closes on a successful (non-throwing) submit.
 */
export default function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Enregistrer",
  cancelLabel = "Annuler",
  side = "right",
}: FormSheetProps) {
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      setSubmitting(true)
      await onSubmit()
      onOpenChange(false)
    } catch {
      // Keep the sheet open on failure so the user can correct and retry.
      // The caller is responsible for surfacing the error (toast / field state).
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <SheetContent side={side} className="w-full sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto p-6">{children}</div>

          <SheetFooter>
            <button
              type="button"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 font-medium text-ink transition hover:bg-neutral-100 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitLabel}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
