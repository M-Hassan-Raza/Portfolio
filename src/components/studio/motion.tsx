import { motion, useInView, useReducedMotion } from "motion/react"
import { useRef } from "react"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

/** The site's four springs. Only Pop is bouncy; content never bounces. */
export const springs = {
  settle: { type: "spring", stiffness: 260, damping: 20, mass: 0.9 },
  lift: { type: "spring", stiffness: 400, damping: 22 },
  pop: { type: "spring", stiffness: 500, damping: 15 },
  sheet: { type: "spring", stiffness: 320, damping: 30 },
} as const

/**
 * Settle: an element drops 24px into place with a slight rotation and one soft
 * overshoot when it scrolls into view. Stagger with `index`.
 * The `settle` class keeps it visible for anyone without JavaScript.
 */
export function Settle({
  children,
  index = 0,
  className,
  tilt = 0,
  as = "div",
  ...props
}: {
  children: ReactNode
  index?: number
  className?: string
  tilt?: number
  as?: "div" | "li" | "section"
} & Omit<
  ComponentProps<typeof motion.div>,
  "children" | "initial" | "whileInView"
>) {
  const reduced = useReducedMotion()
  // One element type for the props; the tag only changes semantics.
  const Component = (
    as === "li" ? motion.li : as === "section" ? motion.section : motion.div
  ) as typeof motion.div
  const swing = index % 2 === 0 ? -6 : 6
  return (
    <Component
      className={cn("settle", className)}
      initial={
        reduced ? { opacity: 0 } : { opacity: 0, y: 24, rotate: tilt + swing }
      }
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        reduced
          ? { duration: 0.12 }
          : { ...springs.settle, delay: Math.min(index, 6) * 0.06 }
      }
      {...props}
    >
      {children}
    </Component>
  )
}

/** Adds data-drawn once the element is in view, which starts the CSS draw. */
export function useDrawOnView<T extends Element>(amount = 0.6) {
  const ref = useRef<T>(null)
  const inView = useInView(ref, { once: true, amount })
  return { ref, drawn: inView }
}
