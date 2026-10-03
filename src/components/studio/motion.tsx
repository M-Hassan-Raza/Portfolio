import type { CSSProperties, ReactNode } from "react"
import { useEnter } from "@/lib/enter"
import { cn } from "@/lib/utils"

/**
 * The site's four springs, for the easter eggs that animate with Motion. The
 * everyday UI uses their CSS twins (--ease-settle, --ease-pop in styles.css)
 * so the page never waits on an animation library. Only Pop is bouncy;
 * content never bounces.
 */
export const springs = {
  settle: { type: "spring", stiffness: 260, damping: 20, mass: 0.9 },
  lift: { type: "spring", stiffness: 400, damping: 22 },
  pop: { type: "spring", stiffness: 500, damping: 15 },
  sheet: { type: "spring", stiffness: 320, damping: 30 },
} as const

/**
 * Settle: an element drops 24px into place with a slight rotation and one soft
 * overshoot when it scrolls into view. Stagger with `index`. Pure CSS (see
 * "Entrances" in styles.css): prerendered content is visible without
 * JavaScript and enters as soon as the HTML is parsed, not after hydration.
 */
export function Settle({
  children,
  index = 0,
  className,
  tilt = 0,
  as = "div",
}: {
  children: ReactNode
  index?: number
  className?: string
  tilt?: number
  as?: "div" | "li" | "section"
}) {
  const enter = useEnter<HTMLDivElement>()
  // One element type for the props; the tag only changes semantics.
  const Tag = as as "div"
  const swing = index % 2 === 0 ? -6 : 6
  return (
    <Tag
      {...enter}
      className={cn("settle", className)}
      style={
        {
          "--settle-i": Math.min(index, 6),
          "--settle-from": `${tilt + swing}deg`,
          ...(tilt !== 0 && { "--settle-to": `rotate(${tilt}deg)` }),
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  )
}
