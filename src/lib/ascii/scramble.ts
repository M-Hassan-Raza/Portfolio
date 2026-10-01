import { useEffect, useRef } from "react"
import type { RefObject } from "react"
import { observeIntersection } from "./media"
import { subscribeFrame } from "./frame-loop"
import { hash01, hash32, seedFrom } from "./rng"

/** Glyphs from the art's own ink ramp, so labels "decode" in the same visual language as the covers. */
export const SCRAMBLE_GLYPHS = ".':,;clxoXkKdO0MNW/\\|-_=+*"

export interface ScrambleOptions {
  enabled: boolean
  /** When to play. "hover" replays on pointerenter / focus with a cooldown of `duration`. */
  trigger?: "mount" | "visible" | "hover"
  duration?: number
  /** Share of `duration` used to stagger characters left → right; the rest is per-char settle. */
  stagger?: number
  tickMs?: number
  glyphs?: string
}

/**
 * Writes into a React-empty, aria-hidden overlay node (never into React-owned text), while the
 * real text stays in the DOM for layout, SEO, and screen readers. Returns nothing; purely imperative.
 */
export function useScrambleText(
  hostRef: RefObject<HTMLElement | null>,
  overlayRef: RefObject<HTMLElement | null>,
  text: string,
  {
    enabled,
    trigger = "visible",
    duration = 650,
    stagger = 0.55,
    tickMs = 45,
    glyphs = SCRAMBLE_GLYPHS,
  }: ScrambleOptions
) {
  const lastPlay = useRef(-Infinity)

  useEffect(() => {
    const host = hostRef.current
    const overlay = overlayRef.current
    if (!enabled || !host || !overlay) return
    const seed = seedFrom(text)
    const settle = duration * (1 - stagger)
    const n = text.length
    // Per-char resolve time: left-to-right stagger plus seeded jitter, whitespace resolves instantly.
    const resolveAt = Float32Array.from(text, (ch, i) =>
      /\s/.test(ch)
        ? 0
        : (i / Math.max(1, n - 1)) * duration * stagger +
          settle * (0.35 + 0.65 * hash01(seed, i))
    )
    let stopFrame: (() => void) | null = null

    const play = () => {
      const now = performance.now()
      if (now - lastPlay.current < duration) return
      lastPlay.current = now
      stopFrame?.()
      const start = now
      host.dataset.scramble = "live"
      stopFrame = subscribeFrame((t) => {
        const elapsed = t - start
        const bucket = Math.floor(elapsed / tickMs)
        let out = ""
        for (let i = 0; i < n; i++) {
          const ch = text[i]!
          out +=
            elapsed >= (resolveAt[i] ?? 0)
              ? ch
              : glyphs[hash32(seed, i, bucket) % glyphs.length]
        }
        overlay.textContent = out
        if (elapsed >= duration) {
          delete host.dataset.scramble
          overlay.textContent = ""
          stopFrame = null
          return false
        }
      }, 60)
    }

    let cleanupTrigger: () => void = () => {}
    if (trigger === "mount") play()
    else if (trigger === "visible") {
      const stop = observeIntersection(
        host,
        (entry) => {
          if (!entry.isIntersecting) return
          stop()
          play()
        },
        { threshold: 0.6 }
      )
      cleanupTrigger = stop
    } else {
      host.addEventListener("pointerenter", play)
      host.addEventListener("focusin", play)
      cleanupTrigger = () => {
        host.removeEventListener("pointerenter", play)
        host.removeEventListener("focusin", play)
      }
    }
    return () => {
      cleanupTrigger()
      stopFrame?.()
      delete host.dataset.scramble
      overlay.textContent = ""
    }
  }, [
    enabled,
    trigger,
    duration,
    stagger,
    tickMs,
    glyphs,
    text,
    hostRef,
    overlayRef,
  ])
}
