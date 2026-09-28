import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"
import type { MotionValue } from "motion/react"
import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"
import type { Hue } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { Face, Shape } from "./shape"
import type { ShapeName } from "./shape"
import { springs } from "./motion"

export type FieldShape = {
  shape: ShapeName
  hue: Hue
  /** Position and size, e.g. "-top-16 -left-10 w-64". Cropped by the field edge. */
  className: string
  rotate?: number
  /** Pointer parallax strength, 0 to 1. */
  depth?: number
  drift?: { x: number; y: number; r: number; duration: number; delay: number }
  face?: boolean
}

/**
 * Flat card-cut shapes scattered in a band, cropped by its edges. They drop in
 * on a staggered spring, drift slowly while idle, and lean away from the pointer.
 */
export function ShapeField({
  shapes,
  className,
}: {
  shapes: readonly FieldShape[]
  className?: string
}) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const x = useSpring(pointerX, { stiffness: 120, damping: 20 })
  const y = useSpring(pointerY, { stiffness: 120, damping: 20 })

  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) delete field.dataset.driftPaused
      else field.dataset.driftPaused = ""
    })
    observer.observe(field)
    const fine = window.matchMedia("(pointer: fine)").matches
    if (!fine || reduced) return () => observer.disconnect()
    function onMove(event: PointerEvent) {
      pointerX.set((event.clientX / window.innerWidth - 0.5) * 2)
      pointerY.set((event.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener("pointermove", onMove)
    }
  }, [pointerX, pointerY, reduced])

  return (
    <div
      ref={fieldRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {shapes.map((item, index) => (
        <FieldPiece
          key={`${item.shape}-${index}`}
          item={item}
          index={index}
          x={x}
          y={y}
          reduced={!!reduced}
        />
      ))}
    </div>
  )
}

function FieldPiece({
  item,
  index,
  x,
  y,
  reduced,
}: {
  item: FieldShape
  index: number
  x: MotionValue<number>
  y: MotionValue<number>
  reduced: boolean
}) {
  const depth = (item.depth ?? 0.5) * 12
  const px = useTransform(x, (value) => value * -depth)
  const py = useTransform(y, (value) => value * -depth)
  const drift = item.drift
  return (
    <motion.div
      data-hue={item.hue}
      className={cn("absolute text-hue", item.className)}
      style={{ x: px, y: py }}
    >
      <motion.div
        className="settle"
        initial={
          reduced
            ? { opacity: 0 }
            : { opacity: 0, y: -24, rotate: (item.rotate ?? 0) - 8 }
        }
        animate={{ opacity: 1, y: 0, rotate: item.rotate ?? 0 }}
        transition={
          reduced
            ? { duration: 0.12 }
            : { ...springs.settle, delay: 0.1 + index * 0.07 }
        }
      >
        <div
          className="drift relative"
          style={
            drift
              ? ({
                  "--drift-x": `${drift.x}px`,
                  "--drift-y": `${drift.y}px`,
                  "--drift-r": `${drift.r}deg`,
                  "--drift-duration": `${drift.duration}s`,
                  "--drift-delay": `${drift.delay}s`,
                } as CSSProperties)
              : undefined
          }
        >
          <Shape name={item.shape} className="size-full" />
          {item.face && (
            <Face
              mood="happy"
              className="absolute top-[38%] left-1/2 w-[34%] -translate-x-1/2"
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
