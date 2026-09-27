import { cn } from "@/lib/utils"
import { useRef } from "react"
import type { ElementType } from "react"
import { usePrefersReducedMotion } from "@/lib/ascii/media"
import { useScrambleText } from "@/lib/ascii/scramble"
import type { ScrambleOptions } from "@/lib/ascii/scramble"

/**
 * The real text always renders (SSR, layout, a11y, find-in-page). While scrambling, CSS makes it
 * transparent and an aria-hidden overlay on top shows the glyphs. Intended for monospace labels,
 * where scrambled glyphs have the same advance as the final ones; for proportional headings the
 * overlay clips instead of reflowing.
 */
export function ScrambleText({
  text,
  as: Tag = "span",
  className,
  ...options
}: { text: string; as?: ElementType; className?: string } & Omit<
  ScrambleOptions,
  "enabled"
>) {
  const hostRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLSpanElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  useScrambleText(hostRef, overlayRef, text, {
    ...options,
    enabled: !reducedMotion,
  })
  return (
    <Tag ref={hostRef} className={cn("scramble", className)}>
      <span className="scramble-text">{text}</span>
      <span ref={overlayRef} className="scramble-glyphs" aria-hidden="true" />
    </Tag>
  )
}
