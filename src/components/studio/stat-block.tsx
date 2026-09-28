import { animate, motion, useInView, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { shapeNames, Shape } from "./shape"
import { hues } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { springs } from "./motion"

/**
 * A big soft numeral and a grid of exactly N little shapes (capped at 24,
 * with a plus beyond). The numeral counts up and the shapes pop in once.
 */
export function StatBlock({
  value,
  suffix = "",
  label,
  children,
  className,
}: {
  value: number
  suffix?: string
  label: ReactNode
  children?: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(value)
  const started = useRef(false)

  useEffect(() => {
    if (reduced || started.current) return
    started.current = true
    setShown(0)
  }, [reduced])
  useEffect(() => {
    if (!inView || reduced) return
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setShown(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView, reduced, value])

  const count = Math.min(value, 24)
  return (
    <div ref={ref} className={cn("flex flex-col gap-8", className)}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex max-w-[15rem] flex-col gap-3 pt-3">
          <p className="type-h3 text-ink">{label}</p>
          {children}
        </div>
        <p className="type-numeral text-ink" aria-label={`${value}${suffix}`}>
          <span aria-hidden="true">
            {shown}
            {suffix}
          </span>
        </p>
      </div>
      <ul
        aria-hidden="true"
        className="grid grid-cols-6 gap-1.5 sm:grid-cols-8"
      >
        {Array.from({ length: count }, (_, index) => {
          const name =
            shapeNames[(index * 5 + value) % shapeNames.length] ?? "circle"
          const hue = hues[(index * 7 + value) % hues.length] ?? "peach"
          return (
            <motion.li
              key={index}
              data-hue={hue}
              className="settle aspect-square text-hue"
              initial={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : undefined}
              transition={{ ...springs.pop, delay: index * 0.025 }}
            >
              <Shape name={name} className="size-full" />
            </motion.li>
          )
        })}
        {value > 24 && (
          <li className="grid aspect-square place-items-center rounded-full bg-ink text-lg font-bold text-paper">
            +
          </li>
        )}
      </ul>
    </div>
  )
}
