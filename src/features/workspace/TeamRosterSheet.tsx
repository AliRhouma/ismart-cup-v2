import { useEffect, useMemo, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Plus, Trash2, Users } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import Avatar from "@/components/kit/Avatar"
import EmptyState from "@/components/kit/EmptyState"
import { usePlayers } from "@/stores/usePlayers"
import type { Player, Team } from "@/data/types"

/**
 * Slide-over roster for one team: players grouped by position, with inline
 * add + remove. Opened from the Équipes table (Effectif column). Counts ripple
 * back to the table live since both read the same usePlayers store.
 */

const POSITIONS = ["Gardien", "Défenseur", "Milieu", "Attaquant"] as const

const INPUT =
  "h-10 w-full rounded-lg border border-input bg-input-bg px-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/30"
const SELECT =
  "h-10 rounded-lg border border-input bg-input-bg px-3 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/30"

interface TeamRosterSheetProps {
  team: Team
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TeamRosterSheet({ team, open, onOpenChange }: TeamRosterSheetProps) {
  const players = usePlayers((s) => s.players)
  const addPlayer = usePlayers((s) => s.addPlayer)
  const removePlayer = usePlayers((s) => s.removePlayer)

  const [name, setName] = useState("")
  const [position, setPosition] = useState<string>("")

  // Clear the add field when switching teams / reopening.
  useEffect(() => {
    setName("")
  }, [team.id, open])

  const roster = useMemo(
    () => players.filter((p) => p.teamId === team.id),
    [players, team.id],
  )

  // Group by position in line order; unknown / missing positions fall to "Autres".
  const groups = useMemo(() => {
    const byPosition = new Map<string, Player[]>()
    for (const p of roster) {
      const key = p.position && (POSITIONS as readonly string[]).includes(p.position) ? p.position : "Autres"
      const list = byPosition.get(key) ?? []
      list.push(p)
      byPosition.set(key, list)
    }
    return [...POSITIONS, "Autres"]
      .filter((k) => byPosition.has(k))
      .map((k) => ({
        position: k,
        players: byPosition.get(k)!.sort((a, b) => a.name.localeCompare(b.name, "fr")),
      }))
  }, [roster])

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Veuillez renseigner le nom du joueur.")
      return
    }
    addPlayer({ teamId: team.id, name: trimmed, position: position || undefined })
    toast.success(`« ${trimmed} » ajouté à ${team.name}.`)
    setName("")
  }

  function handleRemove(player: Player) {
    removePlayer(player.id)
    toast.success(`« ${player.name} » retiré de l'effectif.`)
  }

  const countLabel =
    roster.length === 0 ? "Aucun joueur" : `${roster.length} joueur${roster.length > 1 ? "s" : ""}`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Users className="size-5" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="truncate">{team.name}</SheetTitle>
              <SheetDescription>
                {countLabel} · {team.category}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {roster.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun joueur"
              message={`L'effectif de ${team.name} est vide. Ajoutez le premier joueur ci-dessous.`}
            />
          ) : (
            <div className="space-y-5">
              {groups.map((group) => (
                <div key={group.position}>
                  <div className="mb-2 flex items-center gap-2 px-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {group.position}
                    </h3>
                    <span className="text-xs text-ink-muted">{group.players.length}</span>
                  </div>
                  <ul className="space-y-0.5">
                    {group.players.map((player) => (
                      <li
                        key={player.id}
                        className="group flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-neutral-50"
                      >
                        <Avatar name={player.name} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                          {player.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(player)}
                          aria-label={`Retirer ${player.name}`}
                          className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-muted opacity-0 transition hover:bg-danger-50 hover:text-danger-600 focus-visible:opacity-100 group-hover:opacity-100"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleAdd} className="space-y-2.5 border-t border-border p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du joueur"
            className={INPUT}
          />
          <div className="flex gap-2">
            <select value={position} onChange={(e) => setPosition(e.target.value)} className={`${SELECT} flex-1`}>
              <option value="">Poste (optionnel)</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus className="size-4" /> Ajouter
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
