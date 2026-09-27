import { useEffect, useLayoutEffect, useRef } from "react"
import type { RefObject } from "react"
import { observeIntersection } from "./media"
import { getSurface } from "./surface"
import { LensLayer, RevealLayer, ShimmerLayer } from "./layers"
import type { LensOptions, RevealOptions, ShimmerOptions } from "./layers"

type FrameRef = RefObject<HTMLElement | null>
type Enabled = { enabled: boolean }

/**
 * Plays once per mount. If the art is on screen when the hook becomes enabled it plays
 * immediately (the pre-hydration CSS in §2.1 has kept it hidden, so there's no flash).
 * If it is off screen it is armed (static art hidden, invisible to the user anyway) and plays
 * on first intersection. Disabled (reduced motion, no content yet) = static art, untouched.
 */
export function useAsciiReveal(
  frameRef: FrameRef,
  {
    enabled,
    hold = false,
    threshold = 0.25,
    ...options
  }: RevealOptions &
    Enabled & {
      /** Keep the pre-hydration hide while not yet enabled (content loading / hydration pass). */
      hold?: boolean
      threshold?: number
    }
) {
  const played = useRef(false)
  const optionsRef = useRef(options)
  optionsRef.current = options

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    if (!enabled || played.current) {
      // During the hydration pass `enabled` is false because the reduced-motion store reports its
      // server snapshot; releasing here would flash the final art for a frame. Only release when the
      // user really prefers reduced motion or nothing is pending. The CSS failsafe covers the rest.
      const reallyReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      if (!frame.dataset.fx && (played.current || !hold || reallyReduced))
        frame.dataset.fx = "idle"
      return
    }
    const surface = getSurface(frame)
    if (!surface) return
    let layer: RevealLayer | null = null
    const play = () => {
      played.current = true
      layer = new RevealLayer(surface.grid, {
        ...optionsRef.current,
        onDone: () => {
          layer = null
          optionsRef.current.onDone?.()
        },
      })
      surface.add(layer, 30)
    }
    const rect = frame.getBoundingClientRect()
    const onScreen = rect.bottom > 0 && rect.top < window.innerHeight
    if (onScreen) {
      play()
      return () => {
        if (layer) surface.remove(layer)
      }
    }
    surface.arm()
    const stop = observeIntersection(
      frame,
      (entry) => {
        if (!entry.isIntersecting || played.current) return
        stop()
        play()
      },
      { threshold }
    )
    return () => {
      stop()
      if (layer) surface.remove(layer)
      else if (!played.current) frame.dataset.fx = "idle"
    }
  }, [enabled, hold, frameRef, threshold])
}

export function useAsciiLens(
  frameRef: FrameRef,
  { enabled, ...options }: LensOptions & Enabled
) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    const frame = frameRef.current
    if (!enabled || !frame) return
    const surface = getSurface(frame)
    if (!surface) return
    let layer: LensLayer | null = null
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return
      if (!layer || layer.idle) {
        if (layer) surface.remove(layer)
        const next = new LensLayer(surface.grid, frame, optionsRef.current)
        next.onEnd = () => {
          if (layer === next) layer = null
        }
        layer = next
        layer.point(event.clientX, event.clientY)
        surface.add(layer, 60) // pointer-driven: allow 60fps; reveal/shimmer stay at their caps
        return
      }
      layer.point(event.clientX, event.clientY)
    }
    const onLeave = () => layer?.release()
    frame.addEventListener("pointermove", onMove, { passive: true })
    frame.addEventListener("pointerleave", onLeave, { passive: true })
    return () => {
      frame.removeEventListener("pointermove", onMove)
      frame.removeEventListener("pointerleave", onLeave)
      if (layer) surface.remove(layer)
    }
  }, [enabled, frameRef])
}

export function useAsciiShimmer(
  frameRef: FrameRef,
  { enabled, ...options }: ShimmerOptions & Enabled
) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    const frame = frameRef.current
    if (!enabled || !frame) return
    const surface = getSurface(frame)
    if (!surface) return
    let layer: ShimmerLayer | null = null
    const stop = observeIntersection(frame, (entry) => {
      if (entry.isIntersecting && !layer) {
        layer = new ShimmerLayer(surface.grid, optionsRef.current)
        surface.add(layer, 15) // 15fps is plenty for a 60ms glyph quantum
      } else if (!entry.isIntersecting && layer) {
        surface.remove(layer)
        layer = null
      }
    })
    return () => {
      stop()
      if (layer) surface.remove(layer)
    }
  }, [enabled, frameRef])
}
