import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { useEnter } from "@/lib/enter"

/**
 * Hand-drawn marks, authored once and reused. Round caps, drawn from nothing
 * to full length when they scroll into view (a CSS entrance, see styles.css).
 * One per screen at most, and never on a headline word.
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
  double: {
    viewBox: "0 0 220 30",
    paths: [
      "M5 12 C48 5 104 3 146 6 C174 8 196 11 215 6",
      "M18 24 C60 18 120 17 200 20",
    ],
  },
  arrow: {
    viewBox: "0 0 120 80",
    paths: ["M8 10 C22 52 58 70 106 56", "M90 44 L107 56 L94 70"],
  },
  squiggle: {
    viewBox: "0 0 124 32",
    paths: [
      "M4 20 C12 5 24 5 30 17 C36 29 48 29 55 15 C62 2 76 3 81 16 C86 29 100 29 106 15 C110 7 116 7 120 12",
    ],
  },
} as const

export type ScribbleVariant = keyof typeof marks

export function Scribble({
  variant,
  className,
  delay = 200,
  strokeWidth = 3,
  css = false,
}: {
  variant: ScribbleVariant
  className?: string
  /** ms after it arrives */
  delay?: number
  strokeWidth?: number
  /** Draw with a CSS keyframe (for pages that ship no JavaScript). */
  css?: boolean
}) {
  const enter = useEnter<SVGSVGElement>()
  const mark = marks[variant]
  return (
    <svg
      {...(css ? {} : enter)}
      viewBox={mark.viewBox}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      className={cn(
        "scribble pointer-events-none block overflow-visible",
        css && "scribble-css",
        className
      )}
      data-mark={variant}
      style={{ "--scribble-delay": `${delay}ms` } as CSSProperties}
    >
      {mark.paths.map((path) => (
        <path key={path} d={path} strokeWidth={strokeWidth} />
      ))}
    </svg>
  )
}
