import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Advance width in em of each fitted string at the .fit-text settings
 * (Bricolage Grotesque, wght 800, wdth 88, opsz 96, -0.045em), measured once
 * in Chromium. Unknown strings get an estimate.
 */
const measured: Record<string, number> = {
  "Hassan Raza": 4.457,
  "404": 1.435,
  Obelisk: 2.572,
  Polaris: 2.385,
  October: 2.82,
  Anatomia: 3.384,
  Bonnet: 2.507,
  Cogitator: 3.238,
  RISQ: 1.619,
}

export function fitOf(text: string) {
  return (measured[text] ?? text.length * 0.52) + 0.03
}

/**
 * Type sized to hit both edges of its container. Pure CSS (container units),
 * so there is no measuring script and no layout shift.
 */
export function FitText({
  text,
  className,
  textClassName,
  scale = 1,
  rise = false,
  children,
}: {
  text: string
  className?: string
  textClassName?: string
  /** Fraction of the container width the word should span. */
  scale?: number
  /** Rise out of a mask on first paint. */
  rise?: boolean
  /** Alternative rendering; `text` still decides the size. */
  children?: ReactNode
}) {
  const content = children ?? text
  return (
    <span className={cn("fit block", className)}>
      <span
        className={cn("fit-text", textClassName)}
        style={{ "--fit": fitOf(text) / scale } as CSSProperties}
      >
        {rise ? (
          <span className="reveal-line">
            <span>{content}</span>
          </span>
        ) : (
          content
        )}
      </span>
    </span>
  )
}
