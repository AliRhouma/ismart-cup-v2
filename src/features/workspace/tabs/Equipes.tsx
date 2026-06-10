import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { Pencil, Plus, Star, Trash2, Users } from "lucide-react"
import PageHeader from "@/components/kit/PageHeader"
import DataTable, { type Column } from "@/components/kit/DataTable"
import Badge from "@/components/kit/Badge"
import Avatar from "@/components/kit/Avatar"
import EmptyState from "@/components/kit/EmptyState"
import FormSheet from "@/components/kit/FormSheet"
import ConfirmDialog from "@/components/kit/ConfirmDialog"
import { useTeams, type TeamInput } from "@/stores/useTeams"
import type { Team } from "@/data/types"
import { cn, fakeDelay } from "@/lib/utils"

/**
 * CANONICAL PAGE TEMPLATE — copy this for every new list/CRUD tab.
 * Composition: PageHeader + summary strip + kit DataTable, with a FormSheet for
 * create/edit and a ConfirmDialog for delete. Every mutation fires a toast;
 * empty + loading states are handled by DataTable.
 */

const CATEGORIES = ["Poule A", "Poule B", "Poule C", "Poule D"] as const

interface FormState {
  name: string
  category: string
  favorite: boolean
}

const BLANK_FORM: FormState = { name: "", category: "Poule A", favorite: false }

export default function Equipes() {
  const { id = "" } = useParams()
  const teams = useTeams((s) => s.teams)
  const addTeam = useTeams((s) => s.addTeam)
  const updateTeam = useTeams((s) => s.updateTeam)
  const removeTeam = useTeams((s) => s.removeTeam)

  // Derive this tournament's teams in the component (keep the store CRUD-only).
  const rows = useMemo(() => teams.filter((t) => t.tournamentId === id), [teams, id])

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
  const [editing, setEditing] = useState<Team | null>(null)
  const [form, setForm] = useState<FormState>(BLANK_FORM)
  const [nameError, setNameError] = useState("")

  // Delete
  const [deleting, setDeleting] = useState<Team | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(BLANK_FORM)
    setNameError("")
    setSheetOpen(true)
  }

  function openEdit(team: Team) {
    setEditing(team)
    setForm({ name: team.name, category: team.category, favorite: team.favorite })
    setNameError("")
    setSheetOpen(true)
  }

  async function handleSubmit() {
    const name = form.name.trim()
    if (!name) {
      setNameError("Le nom de l'équipe est requis.")
      toast.error("Veuillez renseigner le nom de l'équipe.")
      throw new Error("validation") // keeps the FormSheet open
    }

    const input: TeamInput = {
      tournamentId: id,
      name,
      category: form.category,
      favorite: form.favorite,
    }

    if (editing) {
      updateTeam(editing.id, input)
      toast.success(`« ${name} » mise à jour.`)
    } else {
      addTeam(input)
      toast.success(`« ${name} » ajoutée au tournoi.`)
    }
  }

  function toggleFavorite(team: Team) {
    updateTeam(team.id, { favorite: !team.favorite })
    toast.success(
      team.favorite
        ? `« ${team.name} » retirée des favoris.`
        : `« ${team.name} » ajoutée aux favoris.`,
    )
  }

  async function handleDelete() {
    if (!deleting) return
    await fakeDelay(300) // show the confirm button spinner
    removeTeam(deleting.id)
    toast.success(`« ${deleting.name} » supprimée.`)
  }

  const favoritesCount = rows.filter((t) => t.favorite).length

  const columns: Column<Team>[] = [
    {
      key: "favorite",
      header: "",
      headerClassName: "w-12",
      className: "w-12",
      cell: (t) => (
        <button
          type="button"
          onClick={() => toggleFavorite(t)}
          aria-label={t.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={cn(
            "grid size-8 place-items-center rounded-full transition hover:bg-neutral-100",
            t.favorite ? "text-accent2-500" : "text-ink-muted",
          )}
        >
          <Star className={cn("size-4", t.favorite && "fill-current")} />
        </button>
      ),
    },
    {
      key: "name",
      header: "Équipe",
      cell: (t) => (
        <div className="flex items-center gap-3">
          <Avatar name={t.name} size="sm" />
          <span className="font-medium text-ink">{t.name}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      cell: (t) => <Badge variant="brand">{t.category}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (t) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(t)}
            aria-label={`Modifier ${t.name}`}
            className="grid size-9 place-items-center rounded-lg text-ink-muted transition hover:bg-neutral-100 hover:text-ink"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleting(t)}
            aria-label={`Supprimer ${t.name}`}
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
        title="Équipes"
        subtitle="Gérez les équipes inscrites à ce tournoi."
        action={
          <button
            onClick={openCreate}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="size-4" /> Ajouter une équipe
          </button>
        }
      />

      {!loading && rows.length > 0 && (
        <div className="mb-4 flex items-center gap-3 text-sm text-ink-subtle">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success-500" />
            Total des équipes <span className="font-semibold text-ink">{rows.length}</span>
          </span>
          <span className="text-ink-muted">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-3.5 fill-current text-accent2-500" />
            Favoris <span className="font-semibold text-ink">{favoritesCount}</span>
          </span>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(t) => t.id}
        loading={loading}
        empty={
          <EmptyState
            icon={Users}
            title="Aucune équipe inscrite"
            message="Ajoutez la première équipe de ce tournoi pour commencer."
            action={
              <button
                onClick={openCreate}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700"
              >
                <Plus className="size-4" /> Ajouter une équipe
              </button>
            }
          />
        }
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editing ? "Modifier l'équipe" : "Nouvelle équipe"}
        description={
          editing
            ? "Mettez à jour les informations de l'équipe."
            : "Ajoutez une équipe à ce tournoi."
        }
        submitLabel={editing ? "Enregistrer" : "Ajouter"}
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Nom de l'équipe
          </span>
          <input
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }))
              if (nameError) setNameError("")
            }}
            placeholder="Ex. Real Madrid"
            autoFocus
            className={cn(
              "h-11 w-full rounded-lg border bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-ring/30",
              nameError
                ? "border-danger-500 focus:border-danger-500"
                : "border-input focus:border-brand-400",
            )}
          />
          {nameError && (
            <span className="mt-1.5 block text-sm text-danger-600">{nameError}</span>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            Catégorie
          </span>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="h-11 w-full rounded-lg border border-input bg-input-bg px-3.5 text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/30"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-subtle">Équipe favorite</span>
          <button
            type="button"
            role="switch"
            aria-checked={form.favorite}
            onClick={() => setForm((f) => ({ ...f, favorite: !f.favorite }))}
            className={cn(
              "relative h-6 w-11 rounded-full transition",
              form.favorite ? "bg-accent2-500" : "bg-neutral-300",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white shadow transition",
                form.favorite ? "left-[22px]" : "left-0.5",
              )}
            />
          </button>
        </div>
      </FormSheet>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Supprimer « ${deleting?.name ?? ""} » ?`}
        description="Cette action est irréversible. L'équipe sera retirée du tournoi."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </div>
  )
}
