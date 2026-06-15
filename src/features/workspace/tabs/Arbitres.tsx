import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { Pencil, Plus, Trash2, UserCheck } from "lucide-react"
import PageHeader from "@/components/kit/PageHeader"
import DataTable, { type Column } from "@/components/kit/DataTable"
import Badge, { type BadgeVariant } from "@/components/kit/Badge"
import Avatar from "@/components/kit/Avatar"
import EmptyState from "@/components/kit/EmptyState"
import FormSheet from "@/components/kit/FormSheet"
import ConfirmDialog from "@/components/kit/ConfirmDialog"
import { useReferees, type RefereeInput } from "@/stores/useReferees"
import type { Referee, RefereeCategory } from "@/data/types"
import { cn, fakeDelay } from "@/lib/utils"

/**
 * Arbitres tab — list of a tournament's referees. Follows the canonical Équipes
 * slice: PageHeader + summary strip + kit DataTable, FormSheet for create/edit,
 * ConfirmDialog for delete, a toast on every mutation, loading + empty states.
 */

const CATEGORY_META: Record<RefereeCategory, { label: string; variant: BadgeVariant }> = {
  MAIN: { label: "Arbitre principal", variant: "brand" },
  ASSISTANT: { label: "Assistant", variant: "neutral" },
  VAR: { label: "VAR", variant: "info" },
}

const CATEGORIES: RefereeCategory[] = ["MAIN", "ASSISTANT", "VAR"]

interface FormState {
  name: string
  category: RefereeCategory
}

const BLANK_FORM: FormState = { name: "", category: "MAIN" }

export default function Arbitres() {
  const { id = "" } = useParams()
  const referees = useReferees((s) => s.referees)
  const addReferee = useReferees((s) => s.addReferee)
  const updateReferee = useReferees((s) => s.updateReferee)
  const removeReferee = useReferees((s) => s.removeReferee)

  // Derive this tournament's referees in the component (keep the store CRUD-only).
  const rows = useMemo(() => referees.filter((r) => r.tournamentId === id), [referees, id])

  // Simulate a fetch so the loading state is exercised (prototype "looks real").
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    fakeDelay(350).then(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  // Create / edit
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Referee | null>(null)
  const [form, setForm] = useState<FormState>(BLANK_FORM)
  const [nameError, setNameError] = useState("")

  // Delete
  const [deleting, setDeleting] = useState<Referee | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(BLANK_FORM)
    setNameError("")
    setSheetOpen(true)
  }

  function openEdit(referee: Referee) {
    setEditing(referee)
    setForm({ name: referee.name, category: referee.category })
    setNameError("")
    setSheetOpen(true)
  }

  async function handleSubmit() {
    const name = form.name.trim()
    if (!name) {
      setNameError("Le nom de l'arbitre est requis.")
      toast.error("Veuillez renseigner le nom de l'arbitre.")
      throw new Error("validation") // keeps the FormSheet open
    }

    const input: RefereeInput = {
      tournamentId: id,
      name,
      category: form.category,
    }

    if (editing) {
      updateReferee(editing.id, input)
      toast.success(`« ${name} » mis à jour.`)
    } else {
      addReferee(input)
      toast.success(`« ${name} » ajouté au tournoi.`)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    await fakeDelay(300) // show the confirm button spinner
    removeReferee(deleting.id)
    toast.success(`« ${deleting.name} » supprimé.`)
  }

  const countFor = (category: RefereeCategory) => rows.filter((r) => r.category === category).length

  const columns: Column<Referee>[] = [
    {
      key: "name",
      header: "Arbitre",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} size="sm" />
          <span className="font-medium text-ink">{r.name}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      cell: (r) => <Badge variant={CATEGORY_META[r.category].variant}>{CATEGORY_META[r.category].label}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(r)}
            aria-label={`Modifier ${r.name}`}
            className="grid size-9 place-items-center rounded-lg text-ink-muted transition hover:bg-neutral-100 hover:text-ink"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(r)}
            aria-label={`Supprimer ${r.name}`}
            className="grid size-9 place-items-center rounded-lg text-danger-500 transition hover:bg-danger-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Arbitres"
        subtitle="Gérez le corps arbitral affecté à ce tournoi."
        action={
          <button
            onClick={openCreate}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="size-4" /> Ajouter un arbitre
          </button>
        }
      />

      {!loading && rows.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink-subtle">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success-500" />
            Total des arbitres <span className="font-semibold text-ink">{rows.length}</span>
          </span>
          <span className="text-ink-muted">·</span>
          <span>
            Principaux <span className="font-semibold text-ink">{countFor("MAIN")}</span>
          </span>
          <span className="text-ink-muted">·</span>
          <span>
            Assistants <span className="font-semibold text-ink">{countFor("ASSISTANT")}</span>
          </span>
          <span className="text-ink-muted">·</span>
          <span>
            VAR <span className="font-semibold text-ink">{countFor("VAR")}</span>
          </span>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        loading={loading}
        empty={
          <EmptyState
            icon={UserCheck}
            title="Aucun arbitre désigné"
            message="Ajoutez le premier arbitre de ce tournoi pour constituer le corps arbitral."
            action={
              <button
                onClick={openCreate}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700"
              >
                <Plus className="size-4" /> Ajouter un arbitre
              </button>
            }
          />
        }
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editing ? "Modifier l'arbitre" : "Nouvel arbitre"}
        description={
          editing ? "Mettez à jour les informations de l'arbitre." : "Ajoutez un arbitre à ce tournoi."
        }
        submitLabel={editing ? "Enregistrer" : "Ajouter"}
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nom de l'arbitre</span>
          <input
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }))
              if (nameError) setNameError("")
            }}
            placeholder="Ex. Mehdi Jelassi"
            autoFocus
            className={cn(
              "h-11 w-full rounded-lg border bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ring/30",
              nameError ? "border-danger-500 focus:border-danger-500" : "border-input focus:border-brand-400",
            )}
          />
          {nameError && <span className="mt-1.5 block text-sm text-danger-600">{nameError}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Catégorie</span>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as RefereeCategory }))}
            className="h-11 w-full rounded-lg border border-input bg-input-bg px-3.5 text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].label}
              </option>
            ))}
          </select>
        </label>
      </FormSheet>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Supprimer « ${deleting?.name ?? ""} » ?`}
        description="Cette action est irréversible. L'arbitre sera retiré du tournoi."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </div>
  )
}
