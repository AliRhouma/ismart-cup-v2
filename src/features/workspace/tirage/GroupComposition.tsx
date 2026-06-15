import { useMemo, useState, type ReactNode } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { toast } from "sonner"
import { Dices, Eraser, X } from "lucide-react"
import Avatar from "@/components/kit/Avatar"
import { cn } from "@/lib/utils"
import { usePhases } from "@/stores/usePhases"
import type { Phase, PhaseGroup, Team } from "@/data/types"

/**
 * Composition view for a GROUPS phase: a pool of unplaced teams + droppable
 * slots. Assign by drag-and-drop OR click-to-place; drag a slot onto another to
 * swap, drag back to the pool (or ✕) to remove. "Tirage automatique" shuffles
 * the pool into the empty slots — the only real draw logic — with a staggered
 * reveal. All mutations go through the store, so the Classement tab recomputes.
 */
interface GroupCompositionProps {
  phase: Phase
  teams: Team[]
}

interface DragData {
  type: "pool" | "slot"
  teamId?: string
  groupId?: string
  slotIndex?: number
}

function PoolChip({ team, armed, onArm }: { team: Team; armed: boolean; onArm: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pool:${team.id}`,
    data: { type: "pool", teamId: team.id } satisfies DragData,
  })
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      onClick={onArm}
      className={cn(
        "inline-flex touch-none items-center gap-2 rounded-full border bg-surface py-1.5 pl-1.5 pr-3 text-sm shadow-sm transition",
        armed ? "border-brand-400 ring-2 ring-brand-200" : "border-border hover:border-brand-300",
        isDragging && "opacity-40",
      )}
    >
      <Avatar name={team.name} size="sm" />
      <span className="font-medium text-ink">{team.name}</span>
    </button>
  )
}

function FilledChip({
  groupId,
  index,
  teamId,
  name,
  drawing,
  flatIndex,
  onRemove,
}: {
  groupId: string
  index: number
  teamId: string
  name: string
  drawing: boolean
  flatIndex: number
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `chip:${groupId}:${index}`,
    data: { type: "slot", teamId, groupId, slotIndex: index } satisfies DragData,
  })
  return (
    <div className={cn("flex min-w-0 flex-1 items-center justify-between gap-2", isDragging && "opacity-40")}>
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        type="button"
        className={cn(
          "flex min-w-0 touch-none items-center gap-2",
          drawing && "animate-in fade-in-0 zoom-in-95 duration-300",
        )}
        style={drawing ? { animationDelay: `${flatIndex * 60}ms` } : undefined}
      >
        <Avatar name={name} size="sm" />
        <span className="truncate text-sm font-medium text-ink">{name}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`Retirer ${name}`}
        className="grid size-7 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-danger-50 hover:text-danger-600"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

function SlotRow({
  group,
  index,
  teamId,
  name,
  armed,
  drawing,
  flatIndex,
  onPlace,
  onRemove,
}: {
  group: PhaseGroup
  index: number
  teamId: string | null
  name: string
  armed: boolean
  drawing: boolean
  flatIndex: number
  onPlace: () => void
  onRemove: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot:${group.id}:${index}`,
    data: { type: "slot", groupId: group.id, slotIndex: index } satisfies DragData,
  })
  return (
    <li
      ref={setNodeRef}
      onClick={() => armed && onPlace()}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition",
        isOver
          ? "border-brand-300 bg-brand-50"
          : teamId
            ? "border-border bg-surface"
            : "border-dashed border-border bg-surface-subtle",
        armed && "cursor-pointer hover:border-brand-300 hover:bg-brand-50",
      )}
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-neutral-100 text-xs font-semibold text-ink-muted">
        {index + 1}
      </span>
      {teamId ? (
        <FilledChip
          key={teamId}
          groupId={group.id}
          index={index}
          teamId={teamId}
          name={name}
          drawing={drawing}
          flatIndex={flatIndex}
          onRemove={onRemove}
        />
      ) : (
        <span className="text-sm text-ink-muted">{armed ? "Cliquez pour placer ici" : "Glissez une équipe ici"}</span>
      )}
    </li>
  )
}

function PoolDropZone({ children }: { children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool", data: { type: "pool" } satisfies DragData })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border bg-surface-subtle p-4 transition",
        isOver ? "border-brand-300 ring-1 ring-brand-200" : "border-border",
      )}
    >
      {children}
    </div>
  )
}

export default function GroupComposition({ phase, teams }: GroupCompositionProps) {
  const assignTeam = usePhases((s) => s.assignTeam)
  const autoDraw = usePhases((s) => s.autoDraw)
  const clearAssignments = usePhases((s) => s.clearAssignments)

  const groups = phase.groups ?? []
  const teamName = useMemo(() => new Map(teams.map((t) => [t.id, t.name])), [teams])
  const placedIds = useMemo(
    () => new Set(groups.flatMap((g) => g.slots).filter((s): s is string => s != null)),
    [groups],
  )
  const pool = useMemo(() => teams.filter((t) => !placedIds.has(t.id)), [teams, placedIds])

  const totalSlots = groups.reduce((n, g) => n + g.slots.length, 0)
  const filledSlots = groups.reduce((n, g) => n + g.slots.filter((s) => s != null).length, 0)
  const emptySlots = totalSlots - filledSlots

  const [armed, setArmed] = useState<string | null>(null)
  const [activeTeam, setActiveTeam] = useState<{ id: string; name: string } | null>(null)
  const [drawing, setDrawing] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const teamAt = (groupId: string, slotIndex: number) =>
    groups.find((g) => g.id === groupId)?.slots[slotIndex] ?? null

  function handleDragStart(e: DragStartEvent) {
    const a = e.active.data.current as DragData | undefined
    if (a?.teamId) setActiveTeam({ id: a.teamId, name: teamName.get(a.teamId) ?? a.teamId })
    setArmed(null)
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveTeam(null)
    const a = e.active.data.current as DragData | undefined
    const o = e.over?.data.current as DragData | undefined
    if (!a?.teamId || !o) return
    const team = a.teamId

    if (o.type === "slot" && o.groupId != null && o.slotIndex != null) {
      const displaced = teamAt(o.groupId, o.slotIndex)
      if (displaced === team) return
      if (a.type === "slot" && displaced && a.groupId != null && a.slotIndex != null) {
        // Swap the two slots.
        assignTeam(phase.id, o.groupId, o.slotIndex, team)
        assignTeam(phase.id, a.groupId, a.slotIndex, displaced)
      } else {
        // Place (or replace — the displaced team falls back to the pool).
        assignTeam(phase.id, o.groupId, o.slotIndex, team)
      }
    } else if (o.type === "pool" && a.type === "slot" && a.groupId != null && a.slotIndex != null) {
      assignTeam(phase.id, a.groupId, a.slotIndex, null)
    }
  }

  function handleAutoDraw() {
    if (emptySlots === 0) return toast.info("Toutes les places sont déjà occupées.")
    if (pool.length === 0) return toast.info("Aucune équipe disponible à placer.")
    const placed = Math.min(pool.length, emptySlots)
    autoDraw(
      phase.id,
      pool.map((t) => t.id),
    )
    setArmed(null)
    setDrawing(true)
    window.setTimeout(() => setDrawing(false), 900)
    toast.success(`Tirage effectué — ${placed} équipe${placed > 1 ? "s" : ""} placée${placed > 1 ? "s" : ""}.`)
  }

  function handleClear() {
    if (filledSlots === 0) return toast.info("Aucune équipe à retirer.")
    clearAssignments(phase.id)
    setArmed(null)
    toast.success("Composition réinitialisée.")
  }

  let flat = -1

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTeam(null)}
    >
      <PoolDropZone>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink-subtle">
            Équipes à placer <span className="font-semibold text-ink">{pool.length}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-ink-subtle transition hover:bg-neutral-100"
            >
              <Eraser className="size-4" /> Vider
            </button>
            <button
              type="button"
              onClick={handleAutoDraw}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Dices className="size-4" /> Tirage automatique
            </button>
          </div>
        </div>

        {pool.length === 0 ? (
          <p className="inline-flex items-center gap-1.5 text-sm text-success-600">Toutes les équipes sont placées ✓</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {pool.map((t) => (
              <PoolChip key={t.id} team={t} armed={armed === t.id} onArm={() => setArmed(armed === t.id ? null : t.id)} />
            ))}
          </div>
        )}
      </PoolDropZone>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-ink">{g.name}</h3>
              <span className="text-xs text-ink-muted">
                {g.slots.filter(Boolean).length}/{g.slots.length}
              </span>
            </div>
            <ul className="space-y-1.5">
              {g.slots.map((teamId, i) => {
                flat++
                return (
                  <SlotRow
                    key={i}
                    group={g}
                    index={i}
                    teamId={teamId}
                    name={teamId ? (teamName.get(teamId) ?? teamId) : ""}
                    armed={!!armed}
                    drawing={drawing}
                    flatIndex={flat}
                    onPlace={() => {
                      if (!armed) return
                      assignTeam(phase.id, g.id, i, armed)
                      setArmed(null)
                    }}
                    onRemove={() => assignTeam(phase.id, g.id, i, null)}
                  />
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTeam ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-surface py-1.5 pl-1.5 pr-3 text-sm shadow-lg">
            <Avatar name={activeTeam.name} size="sm" />
            <span className="font-medium text-ink">{activeTeam.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
