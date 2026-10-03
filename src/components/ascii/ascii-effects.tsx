import type { RefObject } from "react"
import {
  useAsciiLens,
  useAsciiReveal,
  useAsciiShimmer,
} from "@/lib/ascii/hooks"
import { useFinePointer, usePrefersReducedMotion } from "@/lib/ascii/media"
import { seedFrom } from "@/lib/ascii/rng"
import type { AsciiEffects as Effects } from "./ascii-art"

const opts = <T extends object>(value: boolean | T | undefined): T =>
  typeof value === "object" ? value : ({} as T)

/**
 * The live effects for one cover. A chunk of its own with the effects engine,
 * loaded only by covers that ask for effects; plain covers never pay for it.
 */
export default function AsciiEffects({
  frameRef,
  asset,
  effects,
  ready,
}: {
  frameRef: RefObject<HTMLDivElement | null>
  asset: string
  effects: Effects
  /** The art is in the DOM. */
  ready: boolean
}) {
  const reducedMotion = usePrefersReducedMotion()
  const finePointer = useFinePointer()
  const live = ready && !reducedMotion
  const seed = seedFrom(asset)
  const wantsReveal = !!effects.reveal
  useAsciiReveal(frameRef, {
    ...opts(effects.reveal),
    seed,
    enabled: live && wantsReveal,
    hold: wantsReveal && !live,
  })
  useAsciiLens(frameRef, {
    ...opts(effects.lens),
    seed,
    enabled: live && finePointer && !!effects.lens,
  })
  useAsciiShimmer(frameRef, {
    ...opts(effects.shimmer),
    seed,
    enabled: live && !!effects.shimmer,
  })
  return null
}
