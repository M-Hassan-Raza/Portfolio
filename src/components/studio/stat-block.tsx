import { animate, motion, useInView, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { springs } from "./motion"
import { shapeNames, Shape } from "./shape"

/**
 * A big chunky numeral and a grid of exactly N little shapes (capped at 24,
 * with a plus beyond), in one ink. The numeral counts up and the shapes pop
 * in once, when the block scrolls into view.
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
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setShown(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView, reduced, value])

  const count = Math.min(value, 24)
  return (
    <div ref={ref} className={cn("flex flex-col gap-6", className)}>
      <p
        className="type-numeral text-[clamp(6rem,15vw,13rem)] text-block-deep"
        aria-label={`${value}${suffix}`}
      >
        <span aria-hidden="true">
          {shown}
          {suffix}
        </span>
      </p>
      <p className="max-w-[18rem] type-h3">{label}</p>
      <ul
        aria-hidden="true"
        className="grid max-w-[26rem] grid-cols-8 gap-1.5 text-block-deep"
      >
        {Array.from({ length: count }, (_, index) => {
          const name =
            shapeNames[(index * 5 + value) % shapeNames.length] ?? "circle"
          return (
            <motion.li
              key={index}
              className="settle aspect-square"
              initial={reduced ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : undefined}
              transition={{ ...springs.pop, delay: 0.1 + index * 0.03 }}
            >
              <Shape name={name} className="size-full" />
            </motion.li>
          )
        })}
        {value > 24 && (
          <li className="grid aspect-square place-items-center rounded-full bg-block-deep text-sm font-extrabold text-block">
            +
          </li>
        )}
      </ul>
      {children}
    </div>
  )
}
