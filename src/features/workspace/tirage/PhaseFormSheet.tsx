import { useEffect, useState } from "react"
import FormSheet from "@/components/kit/FormSheet"
import { cn } from "@/lib/utils"
import type { Phase } from "@/data/types"

/**
 * Create or rename a phase. Name only — the format (poules / élimination /
 * matchs) and its config are set in the configurator (next step), so a freshly
 * created phase starts "À configurer". Throws on empty name to keep the sheet
 * open (canonical FormSheet pattern).
 */
interface PhaseFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null ⇒ create; a phase ⇒ rename. */
  editing: Phase | null
  onSubmit: (name: string) => void
}

export default function PhaseFormSheet({ open, onOpenChange, editing, onSubmit }: PhaseFormSheetProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "")
      setError("")
    }
  }, [open, editing])

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Le nom de la phase est requis.")
      throw new Error("validation")
    }
    onSubmit(trimmed)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Renommer la phase" : "Créer une phase"}
      description={
        editing
          ? "Mettez à jour le nom de cette phase."
          : "Donnez un nom à la phase. Vous choisirez son format à l'étape suivante."
      }
      submitLabel={editing ? "Enregistrer" : "Créer"}
      onSubmit={handleSubmit}
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nom de la phase</span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (error) setError("")
          }}
          placeholder="Ex. Phase de poules, Quarts de finale, Finale"
          autoFocus
          className={cn(
            "h-11 w-full rounded-lg border bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ring/30",
            error ? "border-danger-500 focus:border-danger-500" : "border-input focus:border-brand-400",
          )}
        />
        {error && <span className="mt-1.5 block text-sm text-danger-600">{error}</span>}
      </label>
    </FormSheet>
  )
}
