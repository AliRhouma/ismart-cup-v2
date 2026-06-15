import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { Plus, Shuffle } from "lucide-react"
import PageHeader from "@/components/kit/PageHeader"
import EmptyState from "@/components/kit/EmptyState"
import ConfirmDialog from "@/components/kit/ConfirmDialog"
import { usePhases, type PhaseConfig } from "@/stores/usePhases"
import { useMatches } from "@/stores/useMatches"
import { useTeams } from "@/stores/useTeams"
import { useTournaments } from "@/stores/useTournaments"
import type { Phase } from "@/data/types"
import PhaseRail from "@/features/workspace/tirage/PhaseRail"
import PhasePanel from "@/features/workspace/tirage/PhasePanel"
import PhaseFormSheet from "@/features/workspace/tirage/PhaseFormSheet"
import PhaseConfigSheet from "@/features/workspace/tirage/PhaseConfigSheet"
import { DEFAULT_POINTS, type PointsRules } from "@/features/workspace/tirage/phaseHelpers"

/**
 * Tirage — the phase builder. Part (b): horizontal phase rail (navigate +
 * reorder) + create / rename / delete + a focused panel for the selected phase.
 * The configurator, team pool, group tables and matchup cards land next.
 */
export default function Tirage() {
  const { id = "" } = useParams()
  const allPhases = usePhases((s) => s.phases)
  const addPhase = usePhases((s) => s.addPhase)
  const renamePhase = usePhases((s) => s.renamePhase)
  const removePhase = usePhases((s) => s.removePhase)
  const reorderPhase = usePhases((s) => s.reorderPhase)
  const configurePhase = usePhases((s) => s.configurePhase)
  const matches = useMatches((s) => s.matches)
  const teams = useTeams((s) => s.teams)
  const tournament = useTournaments((s) => s.tournaments).find((t) => t.id === id)

  const phases = useMemo(
    () => allPhases.filter((p) => p.tournamentId === id).sort((a, b) => a.order - b.order),
    [allPhases, id],
  )
  const tournamentTeams = useMemo(() => teams.filter((t) => t.tournamentId === id), [teams, id])
  const registeredTeams = tournamentTeams.length
  const points: PointsRules = {
    win: tournament?.pointsForWin ?? DEFAULT_POINTS.win,
    draw: tournament?.pointsForDraw ?? DEFAULT_POINTS.draw,
    loss: tournament?.pointsForLoss ?? DEFAULT_POINTS.loss,
  }

  // Selection — default to the in-progress phase, keep valid across add/delete.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useEffect(() => {
    if (phases.length === 0) {
      if (selectedId) setSelectedId(null)
      return
    }
    if (!selectedId || !phases.some((p) => p.id === selectedId)) {
      setSelectedId((phases.find((p) => p.status === "current") ?? phases[0]).id)
    }
  }, [phases, selectedId])
  const selected = phases.find((p) => p.id === selectedId) ?? null

  // Create / rename
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null)

  function openCreate() {
    setEditingPhase(null)
    setSheetOpen(true)
  }
  function openRename(phase: Phase) {
    setEditingPhase(phase)
    setSheetOpen(true)
  }
  function handleSubmitName(name: string) {
    if (editingPhase) {
      renamePhase(editingPhase.id, name)
      toast.success("Phase renommée.")
    } else {
      const order = phases.reduce((max, p) => Math.max(max, p.order), 0) + 1
      const created = addPhase({ tournamentId: id, name, order, status: "upcoming" })
      setSelectedId(created.id)
      toast.success(`Phase « ${name} » créée.`)
    }
  }

  // Configure / reconfigure — prefill from the phase's current structure.
  const [configuringPhase, setConfiguringPhase] = useState<Phase | null>(null)
  function currentConfig(phase: Phase): PhaseConfig | null {
    if (!phase.kind) return null
    if (phase.kind === "GROUPS") {
      const g = phase.groups ?? []
      return { kind: "GROUPS", numberOfGroups: g.length || 2, teamsPerGroup: g[0]?.slots.length ?? 4 }
    }
    const count = matches.filter((m) => m.phaseId === phase.id).length
    return phase.kind === "KNOCKOUT"
      ? { kind: "KNOCKOUT", numberOfMatchups: count || 2 }
      : { kind: "MATCHES", numberOfMatches: count || 2 }
  }
  function handleConfigure(config: PhaseConfig) {
    if (!configuringPhase) return
    configurePhase(configuringPhase.id, config)
    toast.success(`« ${configuringPhase.name} » configurée.`)
  }

  // Delete
  const [deletingPhase, setDeletingPhase] = useState<Phase | null>(null)
  function handleDelete() {
    if (!deletingPhase) return
    removePhase(deletingPhase.id)
    toast.success(`Phase « ${deletingPhase.name} » supprimée.`)
  }

  const createButton = (
    <button
      onClick={openCreate}
      className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Plus className="size-4" /> Créer une phase
    </button>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tirage"
        subtitle="Construisez les phases du tournoi, placez les équipes et lancez le tirage."
        action={createButton}
      />

      {phases.length === 0 ? (
        <EmptyState
          icon={Shuffle}
          title="Aucune phase pour l'instant"
          message="Créez la première phase pour commencer à structurer le tournoi (poules, élimination directe ou matchs)."
          action={
            <button
              onClick={openCreate}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700"
            >
              <Plus className="size-4" /> Créer une phase
            </button>
          }
        />
      ) : (
        <>
          <PhaseRail
            phases={phases}
            matches={matches}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onReorder={reorderPhase}
            onCreate={openCreate}
          />
          {selected && (
            <PhasePanel
              phase={selected}
              matches={matches}
              teams={tournamentTeams}
              points={points}
              onConfigure={setConfiguringPhase}
              onRename={openRename}
              onDelete={setDeletingPhase}
            />
          )}
        </>
      )}

      <PhaseFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editingPhase}
        onSubmit={handleSubmitName}
      />

      <PhaseConfigSheet
        open={!!configuringPhase}
        onOpenChange={(open) => !open && setConfiguringPhase(null)}
        phase={configuringPhase}
        initialConfig={configuringPhase ? currentConfig(configuringPhase) : null}
        registeredTeams={registeredTeams}
        onSubmit={handleConfigure}
      />

      <ConfirmDialog
        open={!!deletingPhase}
        onOpenChange={(open) => !open && setDeletingPhase(null)}
        title={`Supprimer « ${deletingPhase?.name ?? ""} » ?`}
        description="Cette action est irréversible. La phase et toutes ses rencontres seront supprimées."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
      />
    </div>
  )
}
