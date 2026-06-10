import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import EmptyState from "@/components/kit/EmptyState"

export interface Column<T> {
  /** Stable key for the column. */
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  align?: "left" | "right" | "center"
  /** Extra classes for the body cell. */
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  loading?: boolean
  /** Skeleton row count while loading. */
  loadingRows?: number
  /** Custom empty content; defaults to <EmptyState>. */
  empty?: ReactNode
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const

/**
 * Generic data table with empty + loading states baked in (design system §6).
 * Keeps every page's table on-brand and consistent — never hand-roll a <table>.
 */
export default function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  loadingRows = 5,
  empty,
  emptyMessage = "Aucune donnée à afficher.",
  onRowClick,
}: DataTableProps<T>) {
  const showEmpty = !loading && rows.length === 0

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-surface-muted">
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-ink-muted">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3",
                  col.align && alignClass[col.align],
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {loading &&
            Array.from({ length: loadingRows }).map((_, r) => (
              <tr key={`skeleton-${r}`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            rows.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "transition hover:bg-neutral-50",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-4 text-ink",
                      col.align && alignClass[col.align],
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}

          {showEmpty && (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {empty ?? <EmptyState message={emptyMessage} />}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
