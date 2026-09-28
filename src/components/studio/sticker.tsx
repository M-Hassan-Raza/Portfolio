import type { LucideIcon } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"
import type { Hue } from "@/lib/studio"
import { cn } from "@/lib/utils"

/**
 * A die-cut label: pastel pill, paper outline, soft drop shadow. Slapped on
 * card corners at a jaunty angle; wiggles when touched.
 */
export function Sticker({
  icon: Icon,
  children,
  hue,
  rotate = -8,
  className,
}: {
  icon?: LucideIcon
  children: ReactNode
  hue: Hue
  rotate?: number
  className?: string
}) {
  return (
    <span
      data-hue={hue}
      className={cn(
        "sticker inline-flex items-center gap-1.5 rounded-full bg-hue px-3 py-1.5 type-label whitespace-nowrap text-on-pastel",
        className
      )}
      style={{ "--sticker-rotate": `${rotate}deg` } as CSSProperties}
    >
      {Icon && (
        <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
      )}
      {children}
    </span>
  )
}

/** A quiet metadata pill: year, role, reading time. Paper on paper. */
export function MetaPill({
  children,
  className,
  tone = "paper",
}: {
  children: ReactNode
  className?: string
  tone?: "paper" | "hue" | "sunk"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.8125rem] font-medium tabular",
        tone === "paper" && "bg-paper-raised text-ink-soft",
        tone === "sunk" && "bg-paper-sunk text-ink-soft",
        tone === "hue" && "bg-hue-tint text-hue-deep",
        className
      )}
    >
      {children}
    </span>
  )
}

/** A small hue dot. Filled marks the current thing. */
export function HueDot({
  hue,
  className,
  style,
}: {
  hue: Hue
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      data-hue={hue}
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full bg-hue",
        className
      )}
      style={style}
    />
  )
}
