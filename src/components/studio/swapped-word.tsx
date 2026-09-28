import type { CSSProperties, ReactNode } from "react"
import type { Hue } from "@/lib/studio"
import { cn } from "@/lib/utils"

/**
 * The one typographic move: a single headline word switches from chunky
 * Bricolage to soft Fraunces italic, on a pastel pill tilted -2deg. It pops
 * in on load. Use it once per page, never in body text.
 */
export function SwappedWord({
  children,
  hue,
  rotate = -2,
  pop = true,
  className,
}: {
  children: ReactNode
  hue: Hue
  rotate?: number
  pop?: boolean
  className?: string
}) {
  return (
    <span
      data-hue={hue}
      data-pop={pop ? "" : undefined}
      className={cn("swap-word", className)}
      style={{ "--swap-rotate": `${rotate}deg` } as CSSProperties}
    >
      <span className="swap-word-pill" aria-hidden="true" />
      <span className="swap-word-text">{children}</span>
    </span>
  )
}
