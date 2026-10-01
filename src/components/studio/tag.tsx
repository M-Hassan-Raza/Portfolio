import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** A quiet metadata pill: year, role, reading time. Ink outline on paper. */
export function MetaPill({
  children,
  className,
  tone = "outline",
}: {
  children: ReactNode
  className?: string
  tone?: "outline" | "sunk" | "block" | "ink"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.8125rem] font-semibold tabular",
        tone === "outline" && "border-[1.5px] border-current",
        tone === "sunk" && "bg-paper-sunk text-ink-soft",
        tone === "block" && "border-[1.5px] border-ink bg-block text-on-block",
        tone === "ink" && "bg-ink text-paper",
        className
      )}
    >
      {children}
    </span>
  )
}

/** A small label with a hard shadow, stuck at an angle (status, awards). */
export function Stamp({
  children,
  rotate = -4,
  className,
}: {
  children: ReactNode
  rotate?: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper-raised px-3 py-1 type-label whitespace-nowrap text-ink shadow-small",
        className
      )}
      style={{ rotate: `${rotate}deg` }}
    >
      {children}
    </span>
  )
}
