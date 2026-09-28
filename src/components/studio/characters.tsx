import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react"
import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Face, Shape } from "./shape"
import type { ShapeName } from "./shape"
import type { Hue } from "@/lib/studio"

/** Eyes that glance toward the pointer, at most `reach` px from centre. */
function useGlance(reach: number) {
  const ref = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 220, damping: 18 })
  const y = useSpring(rawY, { stiffness: 220, damping: 18 })
  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return
    function onMove(event: PointerEvent) {
      const box = ref.current?.getBoundingClientRect()
      if (!box) return
      const dx = event.clientX - (box.left + box.width / 2)
      const dy = event.clientY - (box.top + box.height / 2)
      const distance = Math.hypot(dx, dy) || 1
      const pull = Math.min(1, distance / 240)
      rawX.set((dx / distance) * reach * pull)
      rawY.set((dy / distance) * reach * pull)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [rawX, rawY, reach, reduced])
  return { ref, x, y }
}

/** A small waving hand, drawn in butter with ink motion marks. */
export function WavingHand({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 30"
      aria-hidden="true"
      className={cn("block overflow-visible", className)}
    >
      <g className="wave-hand">
        <g
          stroke="var(--butter)"
          strokeLinecap="round"
          strokeWidth="4.2"
          fill="none"
        >
          <path d="M9.5 15 L8 6.5" />
          <path d="M13.2 14 L12.8 4.5" />
          <path d="M16.8 14.2 L17.6 5.6" />
          <path d="M20.3 16 L22.4 9.6" />
          <path d="M21 20.5 L25.6 16.6" />
        </g>
        <rect
          x="7.5"
          y="13"
          width="15.5"
          height="13.5"
          rx="6.5"
          fill="var(--butter)"
        />
      </g>
      <g
        stroke="var(--ink)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M3 9 Q1.5 12 3 15" />
        <path d="M27 3.5 Q29.5 5.5 29 8.5" />
      </g>
    </svg>
  )
}

/** Ink disc with the monogram; the hand waves when you hover it. */
export function Monogram({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-grid size-10 place-items-center",
        className
      )}
    >
      <span className="grid size-10 place-items-center rounded-full bg-ink text-[0.95rem] font-extrabold tracking-[-0.04em] text-paper [font-stretch:90%]">
        HR
      </span>
      <WavingHand className="absolute -top-2 -right-2.5 size-5" />
    </span>
  )
}

/** The real headshot in a pastel disc, with a hand waving hello. */
export function PortraitDisc({ className }: { className?: string }) {
  return (
    <span className={cn("group relative inline-block", className)}>
      <span className="block size-full overflow-hidden rounded-full border-[3px] border-paper-raised bg-paper-raised shadow-soft">
        <img
          src="/assets/portrait-480.jpg"
          alt=""
          width={450}
          height={480}
          className="size-full object-cover object-[50%_18%]"
        />
      </span>
      <WavingHand className="absolute -top-3 -right-5 size-10" />
    </span>
  )
}

/**
 * A half-disc with eyes, peeking over the footer's wave. Its eyes follow the
 * pointer around the page.
 */
export function PeekCreature({ className }: { className?: string }) {
  const { ref, x, y } = useGlance(5)
  return (
    <svg
      ref={ref}
      viewBox="0 0 160 84"
      aria-hidden="true"
      className={cn("block overflow-visible", className)}
    >
      <path d="M4 84 A76 76 0 0 1 156 84 Z" fill="var(--lilac)" />
      <g fill="var(--paper-raised)">
        <ellipse cx="58" cy="44" rx="14" ry="15" />
        <ellipse cx="102" cy="44" rx="14" ry="15" />
      </g>
      <motion.g style={{ x, y }} fill="var(--on-pastel)">
        <g className="blink">
          <circle cx="58" cy="45" r="6.5" />
          <circle cx="102" cy="45" r="6.5" />
        </g>
      </motion.g>
      <g fill="var(--rose)">
        <ellipse cx="38" cy="66" rx="8" ry="4.5" />
        <ellipse cx="122" cy="66" rx="8" ry="4.5" />
      </g>
    </svg>
  )
}

/**
 * The 404 creature: a rose blob, ink outline, two dot eyes that follow you,
 * and one hand on its chin while it thinks about where the page went.
 */
export function BlobCreature({ className }: { className?: string }) {
  const { ref, x, y } = useGlance(4)
  return (
    <svg
      ref={ref}
      viewBox="0 0 200 230"
      aria-hidden="true"
      className={cn("block overflow-visible", className)}
    >
      <g
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path
          d="M52 222 C44 150 40 110 46 76 C54 30 84 10 108 12 C140 14 160 44 160 88 C160 132 156 176 150 222 Z"
          fill="var(--rose)"
        />
        <path
          d="M98 222 C100 206 108 200 116 204 C122 208 122 216 120 222"
          fill="none"
        />
        <path
          d="M60 150 C56 124 72 110 94 114 C108 116 118 110 120 100 C124 90 138 92 136 104 C134 118 118 130 98 134 C84 136 76 142 76 152"
          fill="var(--rose)"
        />
      </g>
      <motion.g style={{ x, y }} fill="var(--ink)">
        <g className="blink">
          <circle cx="92" cy="66" r="4.2" />
          <circle cx="122" cy="66" r="4.2" />
        </g>
      </motion.g>
      <path
        d="M98 86 Q106 82 114 86"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** A single shape with a face and one line of Fraunces italic. */
export function EmptyState({
  children,
  shape = "scallop",
  hue = "butter",
  className,
}: {
  children: ReactNode
  shape?: ShapeName
  hue?: Hue
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5 rounded-lg bg-paper-sunk px-6 py-14 text-center",
        className
      )}
    >
      <span data-hue={hue} className="relative block size-20 text-hue">
        <Shape name={shape} className="size-full" />
        <Face
          mood="puzzled"
          className="absolute top-[36%] left-1/2 w-[46%] -translate-x-1/2"
        />
      </span>
      <p className="max-w-sm type-annotation text-xl text-ink-soft">
        {children}
      </p>
    </div>
  )
}
