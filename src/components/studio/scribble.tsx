import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { useDrawOnView } from "./motion"

/**
 * Hand-drawn marks, authored once and reused. Stroke in --pop, 2.5px, round
 * caps, drawn from nothing to full length when they scroll into view.
 */
const marks = {
  circle: {
    viewBox: "0 0 220 90",
    paths: [
      "M128 9 C72 3 14 16 8 44 C3 70 64 84 124 80 C182 76 214 60 210 38 C206 14 150 4 92 10 C74 12 60 15 48 20",
    ],
  },
  underline: {
    viewBox: "0 0 220 24",
    paths: ["M5 16 C48 7 104 4 146 8 C174 11 196 15 215 7"],
  },
  arrow: {
    viewBox: "0 0 120 80",
    paths: ["M8 10 C22 52 58 70 106 56", "M90 44 L107 56 L94 70"],
  },
  heart: {
    viewBox: "0 0 64 60",
    paths: [
      "M32 54 C10 38 3 24 10 14 C17 4 29 7 32 18 C35 7 48 3 55 13 C62 24 55 38 36 52",
    ],
  },
  sparkle: {
    viewBox: "0 0 44 44",
    paths: ["M22 4 V15", "M22 29 V40", "M4 22 H15", "M29 22 H40"],
  },
  squiggle: {
    viewBox: "0 0 124 32",
    paths: [
      "M4 20 C12 5 24 5 30 17 C36 29 48 29 55 15 C62 2 76 3 81 16 C86 29 100 29 106 15 C110 7 116 7 120 12",
    ],
  },
  loop: {
    viewBox: "0 0 120 60",
    paths: [
      "M4 44 C24 44 36 38 44 26 C52 12 40 4 32 12 C24 22 40 40 62 40 C84 40 96 28 116 14",
    ],
  },
} as const

export type ScribbleVariant = keyof typeof marks

export function Scribble({
  variant,
  className,
  delay = 200,
  strokeWidth = 2.5,
  hover = false,
}: {
  variant: ScribbleVariant
  className?: string
  /** ms after the parent settles */
  delay?: number
  strokeWidth?: number
  /** Draws on parent .group hover instead of on view. */
  hover?: boolean
}) {
  const { ref, drawn } = useDrawOnView<SVGSVGElement>()
  const mark = marks[variant]
  return (
    <svg
      ref={ref}
      viewBox={mark.viewBox}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      className={cn(
        "scribble pointer-events-none block overflow-visible text-pop",
        hover && "scribble-hover",
        className
      )}
      data-draw={hover ? undefined : ""}
      data-drawn={!hover && drawn ? "" : undefined}
      style={{ "--scribble-delay": `${delay}ms` } as CSSProperties}
    >
      {mark.paths.map((path, index) => (
        <path
          key={path}
          d={path}
          pathLength={1}
          strokeWidth={strokeWidth}
          style={
            index > 0
              ? ({
                  "--scribble-delay": `${delay + 420}ms`,
                } as CSSProperties)
              : undefined
          }
        />
      ))}
    </svg>
  )
}
