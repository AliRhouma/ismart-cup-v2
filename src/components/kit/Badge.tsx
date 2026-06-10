import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-100 text-neutral-600",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-600",
  info: "bg-info-50 text-info-700",
  accent: "bg-accent2-50 text-accent2-700",
}

interface BadgeProps {
  variant?: BadgeVariant
  /** Leading status dot in the current text color. */
  dot?: boolean
  children: ReactNode
  className?: string
}

/** Soft-bg status pill — see design system §2 (Badges & status pills). */
export default function Badge({
  variant = "neutral",
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
