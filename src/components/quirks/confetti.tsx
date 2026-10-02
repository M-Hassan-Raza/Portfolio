import { motion } from "motion/react"
import { useMemo } from "react"
import { Shape, shapeNames } from "@/components/studio/shape"
import { blockNames } from "@/lib/studio"

const count = 44

/** The site's own card-cut shapes, thrown up from the bottom of the screen. */
export function Confetti({ onDone }: { onDone: () => void }) {
  const pieces = useMemo(() => {
    const height = window.innerHeight
    return Array.from({ length: count }, (_, index) => {
      // A fan between straight up and 50° either side.
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.75
      const speed = height * (0.55 + Math.random() * 0.5)
      return {
        shape: shapeNames[index % shapeNames.length] ?? "circle",
        block: blockNames[index % blockNames.length] ?? "tomato",
        size: 16 + Math.random() * 26,
        x: Math.cos(angle) * speed,
        peak: Math.sin(angle) * speed,
        fall: height * 0.25,
        spin: (Math.random() - 0.5) * 900,
        duration: 1.7 + Math.random() * 0.7,
        delay: Math.random() * 0.15,
      }
    })
  }, [])
  const longest = Math.max(
    ...pieces.map((piece) => piece.duration + piece.delay)
  )

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-popover overflow-clip"
    >
      {pieces.map((piece, index) => (
        <motion.div
          key={index}
          data-block={piece.block}
          className="absolute bottom-0 left-1/2 text-block"
          style={{ width: piece.size, height: piece.size }}
          initial={{ x: 0, y: piece.size, rotate: 0, opacity: 1 }}
          animate={{
            x: [0, piece.x * 0.8, piece.x],
            y: [piece.size, piece.peak, piece.fall],
            rotate: piece.spin,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            times: [0, 0.4, 1],
            ease: ["easeOut", "easeIn"],
          }}
          onAnimationComplete={
            piece.duration + piece.delay === longest ? onDone : undefined
          }
        >
          <Shape name={piece.shape} className="size-full" />
        </motion.div>
      ))}
    </div>
  )
}
