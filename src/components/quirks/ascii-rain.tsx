import { useEffect, useRef, useState } from "react"
import { ScrambleText } from "@/components/ascii/scramble-text"
import { SCRAMBLE_GLYPHS } from "@/lib/ascii/scramble"
import { usePrefersReducedMotion } from "@/lib/ascii/media"
import { subscribeFrame } from "@/lib/ascii/frame-loop"
import { cn } from "@/lib/utils"

const cell = 18
const runMs = 6500

/**
 * Falling code in the covers' own ink ramp and typeface. Always on the ink
 * plate, whatever the theme. Click, Esc or waiting ends it.
 */
export function AsciiRain({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [leaving, setLeaving] = useState(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    const tokens = getComputedStyle(document.documentElement)
    const plate = tokens.getPropertyValue("--ink-fixed").trim()
    const glyph = tokens.getPropertyValue("--grass").trim()
    const head = tokens.getPropertyValue("--paper-fixed").trim()

    const scale = window.devicePixelRatio || 1
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width * scale
    canvas.height = height * scale
    context.scale(scale, scale)
    context.fillStyle = plate
    context.fillRect(0, 0, width, height)
    context.font = `500 ${cell}px "Ascii Ink", "Ascii Ink Fallback", monospace`

    const drops = Array.from(
      { length: Math.ceil(width / cell) },
      () => -Math.random() * (height / cell)
    )
    const draw = () => {
      context.globalAlpha = 0.12
      context.fillStyle = plate
      context.fillRect(0, 0, width, height)
      context.globalAlpha = 1
      drops.forEach((row, column) => {
        const char =
          SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)] ??
          "0"
        context.fillStyle = Math.random() > 0.94 ? head : glyph
        context.fillText(char, column * cell, row * cell)
        drops[column] =
          row * cell > height && Math.random() > 0.97 ? 0 : row + 1
      })
    }
    // Reduced motion gets one still frame of rain instead of the fall.
    if (reduced) {
      for (let step = 0; step < 60; step++) draw()
    }
    const stop = reduced ? () => {} : subscribeFrame(draw, 20)
    const timer = setTimeout(() => setLeaving(true), runMs)
    return () => {
      stop()
      clearTimeout(timer)
    }
  }, [reduced])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLeaving(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Waits out the 700ms fade; a timer, because reduced motion skips the transition event.
  useEffect(() => {
    if (!leaving) return
    const timer = setTimeout(onDone, 750)
    return () => clearTimeout(timer)
  }, [leaving, onDone])

  return (
    <div
      role="status"
      aria-label="Falling code. Click or press Escape to stop."
      onClick={() => setLeaving(true)}
      className={cn(
        "fixed inset-0 z-popover flex cursor-pointer items-center justify-center bg-ink-fixed transition-opacity duration-700 starting:opacity-0",
        leaving && "opacity-0"
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <ScrambleText
        text="Wake up, Neo."
        trigger="mount"
        duration={1800}
        className="relative bg-ink-fixed px-4 py-2 font-mono text-2xl text-paper-fixed sm:text-4xl"
      />
    </div>
  )
}
