import { cn } from "@/lib/utils"

// Tint palette to cycle per entity — design system §7 (Avatars).
const TINTS = [
  "bg-brand-100 text-brand-700",
  "bg-accent2-100 text-accent2-600",
  "bg-success-50 text-success-600",
  "bg-info-50 text-info-600",
  "bg-neutral-200 text-neutral-700",
  "bg-danger-50 text-danger-600",
] as const

const SIZES = {
  sm: "size-8 text-[0.625rem]",
  md: "size-10 text-xs",
  lg: "size-12 text-sm",
} as const

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Deterministic: same name → same tint, every render.
function tintFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % TINTS.length
  return TINTS[hash]
}

interface AvatarProps {
  name: string
  /** Optional image; falls back to tinted initials if absent or it fails to load. */
  src?: string
  size?: keyof typeof SIZES
  className?: string
}

/** Circular avatar: image if provided, else deterministic tinted initials. */
export default function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const base = cn(
    "grid shrink-0 place-items-center rounded-full font-semibold",
    SIZES[size],
    className,
  )

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(base, "object-cover")}
      />
    )
  }

  return (
    <span className={cn(base, tintFor(name))} aria-label={name} title={name}>
      {initials(name)}
    </span>
  )
}
