import { motion } from "motion/react"
import { useEffect, useRef } from "react"
import { springs } from "@/components/studio/motion"
import { usePrefersReducedMotion } from "@/lib/ascii/media"

/**
 * Small drawings the terminal prints inline. Flat fills from the six
 * blocks, drawn on the always-ink terminal plate.
 */

/** A rubber stamp that slams onto the output. `onLand` fires on impact. */
export function Stamp({
  children,
  onLand,
}: {
  children: string
  onLand?: () => void
}) {
  return (
    <motion.span
      className="inline-block rounded-md border-4 border-double border-term-error px-4 py-1 font-sans text-2xl font-extrabold tracking-[0.12em] text-term-error uppercase"
      initial={{ scale: 2.6, rotate: -20, opacity: 0 }}
      animate={{ scale: 1, rotate: -7, opacity: 1 }}
      transition={{ ...springs.pop, delay: 0.15 }}
      onAnimationComplete={onLand}
    >
      {children}
    </motion.span>
  )
}

const sandwichLayers = [
  // Bread, ham, tomato, lettuce, bread: built from the bottom up.
  {
    block: "text-lemon",
    node: <rect x="18" y="104" width="164" height="22" rx="6" />,
  },
  {
    block: "text-pink",
    node: (
      <path d="M10 98 Q30 88 50 98 T90 98 T130 98 T170 98 Q186 92 190 98 L188 106 L12 106 Z" />
    ),
  },
  {
    block: "text-tomato",
    node: (
      <g>
        <ellipse cx="52" cy="90" rx="24" ry="8" />
        <ellipse cx="100" cy="90" rx="24" ry="8" />
        <ellipse cx="148" cy="90" rx="24" ry="8" />
      </g>
    ),
  },
  {
    block: "text-grass",
    node: (
      <path d="M8 84 C18 70 26 90 38 78 S58 88 70 76 S92 88 104 76 S126 88 138 76 S160 88 172 76 S188 84 192 82 L190 90 L10 90 Z" />
    ),
  },
  {
    block: "text-lemon",
    node: (
      <path d="M18 78 V46 C18 26 34 20 50 26 C62 12 86 12 100 22 C114 12 138 12 150 26 C166 20 182 26 182 46 V78 Q182 82 178 82 H22 Q18 82 18 78 Z" />
    ),
  },
]

/** Layers drop in from above and land on each other. */
export function Sandwich() {
  return (
    <svg
      viewBox="0 0 200 140"
      className="h-auto w-48 overflow-visible"
      aria-label="A sandwich"
      role="img"
    >
      {sandwichLayers.map((layer, index) => (
        <motion.g
          key={index}
          className={layer.block}
          fill="currentColor"
          initial={{ y: -150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springs.pop, delay: 0.25 + index * 0.22 }}
        >
          {layer.node}
        </motion.g>
      ))}
    </svg>
  )
}

/** Short and stout, with steam. Rocks on its base. */
export function Teapot() {
  return (
    <svg
      viewBox="0 -34 200 214"
      className="h-auto w-44 overflow-visible"
      aria-label="A teapot, steaming"
      role="img"
    >
      <g
        className="text-term-soft"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      >
        <path
          className="steam"
          d="M86 46 c-9 -10 9 -16 0 -26 c-9 -10 9 -16 0 -24"
        />
        <path
          className="steam"
          d="M104 42 c-9 -10 9 -16 0 -26 c-9 -10 9 -16 0 -24"
        />
        <path
          className="steam"
          d="M22 70 c-9 -10 9 -16 0 -26 c-9 -10 9 -16 0 -24"
        />
      </g>
      <motion.g
        style={{ originX: "100px", originY: "168px" }}
        animate={{ rotate: [0, -6, 5, -3, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6 }}
      >
        <g className="text-violet" fill="currentColor">
          <path d="M40 112 C14 104 18 82 8 70 L20 64 C28 80 36 92 58 98 Z" />
          <path
            d="M150 92 C186 88 190 140 146 140"
            fill="none"
            stroke="currentColor"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <ellipse cx="100" cy="116" rx="60" ry="50" />
          <rect x="62" y="156" width="76" height="12" rx="6" />
        </g>
        <g className="text-pink" fill="currentColor">
          <path d="M60 76 Q100 46 140 76 Z" />
          <circle cx="100" cy="54" r="9" />
          <rect x="50" y="108" width="100" height="12" rx="6" />
        </g>
      </motion.g>
    </svg>
  )
}

const train = String.raw`
      o O 0 o  o    o
    o       _______      _________   _________
   ____[]__|  HR   |    |  2017   | |  NOW    |
  |  _   _ |_______|____|_________|_|_________|
  |=(_)=(_)=========|  |=| o     o |=| o     o |
   \_O__O__O__O_/       OO      OO     OO     OO`

/** sl: the train you get for typing ls too fast. Crosses the terminal once. */
export function Locomotive({ onDone }: { onDone?: () => void }) {
  const lane = useRef<HTMLDivElement>(null)
  const art = useRef<HTMLPreElement>(null)
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    const width = lane.current?.clientWidth ?? 600
    const self = art.current?.scrollWidth ?? 400
    if (!art.current || reduced) {
      onDone?.()
      return
    }
    const run = art.current.animate(
      [
        { transform: `translateX(${width}px)` },
        { transform: `translateX(${-self}px)` },
      ],
      { duration: 3600, easing: "linear", fill: "forwards" }
    )
    run.onfinish = () => onDone?.()
    return () => run.cancel()
  }, [onDone, reduced])
  return (
    <div ref={lane} className="relative h-32 w-full overflow-clip">
      <pre
        ref={art}
        aria-label="A steam train crosses the terminal"
        className="absolute top-0 left-0 m-0 leading-tight text-term-accent"
      >
        {train}
      </pre>
    </div>
  )
}

/** cowsay, with a speech bubble sized to the message. */
export function cow(message: string) {
  const text = message.trim() || "Moo. Try cowsay hello."
  const line = "-".repeat(text.length + 2)
  return String.raw` ${line.replace(/-/g, "_")}
< ${text} >
 ${line}
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||`
}
