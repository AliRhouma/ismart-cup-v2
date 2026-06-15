import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Minus, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import Avatar from "@/components/kit/Avatar"
import { cn } from "@/lib/utils"
import { useMatches } from "@/stores/useMatches"
import type { Match } from "@/data/types"

/**
 * Score + penalties entry for one match. Writes through useMatches.updateMatch,
 * marking the match COMPLETED — group standings recompute from there, knockout
 * winners become resolvable. Shared by group fixtures and matchup cards.
 */
interface ResultDialogProps {
  match: Match | null
  teamName: Map<string, string>
  open: boolean
  onOpenChange: (open: boolean) => void
}

function NumberStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const btn =
    "grid size-9 place-items-center text-ink-muted transition hover:bg-neutral-100 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
  return (
    <div className="inline-flex items-center rounded-lg border border-input bg-input-bg">
      <button type="button" aria-label="Diminuer" disabled={value <= 0} onClick={() => onChange(Math.max(0, value - 1))} className={btn}>
        <Minus className="size-4" />
      </button>
      <span className="w-9 text-center text-base font-bold tabular-nums text-ink">{value}</span>
      <button type="button" aria-label="Augmenter" disabled={value >= 99} onClick={() => onChange(Math.min(99, value + 1))} className={btn}>
        <Plus className="size-4" />
      </button>
    </div>
  )
}

function ScoreRow({ name, value, onChange }: { name: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-subtle px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar name={name} size="sm" />
        <span className="truncate font-medium text-ink">{name}</span>
      </div>
      <NumberStepper value={value} onChange={onChange} />
    </div>
  )
}

export default function ResultDialog({ match, teamName, open, onOpenChange }: ResultDialogProps) {
  const updateMatch = useMatches((s) => s.updateMatch)
  const [s1, setS1] = useState(0)
  const [s2, setS2] = useState(0)
  const [pens, setPens] = useState(false)
  const [p1, setP1] = useState(0)
  const [p2, setP2] = useState(0)

  useEffect(() => {
    if (open && match) {
      setS1(match.score1 ?? 0)
      setS2(match.score2 ?? 0)
      setPens(!!match.hasPenalties)
      setP1(match.penaltyScore1 ?? 0)
      setP2(match.penaltyScore2 ?? 0)
    }
  }, [open, match])

  if (!match) return null
  const n1 = (match.team1Id ? teamName.get(match.team1Id) : match.team1Placeholder) ?? "Équipe 1"
  const n2 = (match.team2Id ? teamName.get(match.team2Id) : match.team2Placeholder) ?? "Équipe 2"

  function save() {
    if (!match) return
    updateMatch(match.id, {
      score1: s1,
      score2: s2,
      status: "COMPLETED",
      hasPenalties: pens,
      penaltyScore1: pens ? p1 : undefined,
      penaltyScore2: pens ? p2 : undefined,
    })
    toast.success("Résultat enregistré.")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Saisir le résultat</DialogTitle>
        <DialogDescription>
          {match.name ?? "Rencontre"}
          {match.group ? ` · ${match.group}` : ""}
        </DialogDescription>

        <div className="space-y-2">
          <ScoreRow name={n1} value={s1} onChange={setS1} />
          <ScoreRow name={n2} value={s2} onChange={setS2} />
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-subtle">Tirs au but</span>
            <button
              type="button"
              role="switch"
              aria-checked={pens}
              onClick={() => setPens((v) => !v)}
              className={cn("relative h-6 w-11 rounded-full transition", pens ? "bg-brand-500" : "bg-neutral-300")}
            >
              <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition", pens ? "left-[22px]" : "left-0.5")} />
            </button>
          </div>
          {pens && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <NumberStepper value={p1} onChange={setP1} />
              <span className="text-sm text-ink-muted">tirs au but</span>
              <NumberStepper value={p2} onChange={setP2} />
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 font-medium text-ink transition hover:bg-neutral-100"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={save}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 font-semibold text-brand-foreground shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Enregistrer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
