import { cn } from "@/lib/utils"
import { useLayoutEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { manifest } from "virtual:ascii-manifest"
import {
  useAsciiLens,
  useAsciiReveal,
  useAsciiShimmer,
} from "@/lib/ascii/hooks"
import type {
  LensOptions,
  RevealOptions,
  ShimmerOptions,
} from "@/lib/ascii/layers"
import { useFinePointer, usePrefersReducedMotion } from "@/lib/ascii/media"
import { seedFrom } from "@/lib/ascii/rng"

const GLOB_PREFIX = "/assets/ascii-covers/"
/** Covers denser than this are photographs (jp2a positives for a dark ground), not set type. */
const PHOTO_INK = 0.3

// Client: one lazy chunk per cover, only fetched on client-side navigation to a page that needs it.
const lazyArt = import.meta.glob<string>("/assets/ascii-covers/*.txt", {
  query: "?ascii",
  import: "default",
})
// Server/prerender: synchronous, so the art is inline in the HTML (no Suspense fallback, no $RC swap).
// The `import.meta.env.SSR` branch is statically false in the client build, and the raw-string
// modules are side-effect free, so Rollup drops them from client chunks (verified in §2.2).
const serverArt: Record<string, string> = import.meta.env.SSR
  ? import.meta.glob<string>("/assets/ascii-covers/*.txt", {
      query: "?ascii",
      import: "default",
      eager: true,
    })
  : {}
const clientCache = new Map<string, string>()

function loadArt(asset: string): Promise<string> {
  const cached = clientCache.get(asset)
  if (cached !== undefined) return Promise.resolve(cached)
  const load = lazyArt[`${GLOB_PREFIX}${asset}.txt`]
  if (!load) return Promise.reject(new Error(`Missing ASCII art: ${asset}`))
  return load().then((html) => (clientCache.set(asset, html), html))
}

export interface AsciiEffects {
  reveal?: boolean | Omit<RevealOptions, "seed">
  lens?: boolean | Omit<LensOptions, "seed">
  shimmer?: boolean | Omit<ShimmerOptions, "seed">
}

const opts = <T extends object>(value: boolean | T | undefined): T =>
  typeof value === "object" ? value : ({} as T)

export function AsciiArt({
  asset,
  alt,
  className,
  effects,
}: {
  asset: string
  alt: string
  className?: string
  effects?: AsciiEffects
}) {
  const meta = manifest[asset]
  if (!meta) throw new Error(`Missing ASCII art: ${asset}`)
  const frameRef = useRef<HTMLDivElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  // Server: the escaped art. Client first render: undefined → `__html: ""`, which React does not
  // reconcile against the server DOM during hydration, so the art is never shipped twice.
  const [html, setHtml] = useState<string | undefined>(
    () => serverArt[`${GLOB_PREFIX}${asset}.txt`] ?? clientCache.get(asset)
  )
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    if (preRef.current?.firstChild) {
      setReady(true) // hydrated from SSR, or rendered from cache
      return
    }
    let cancelled = false
    loadArt(asset).then((next) => !cancelled && setHtml(next), console.error)
    return () => {
      cancelled = true
    }
  }, [asset])
  useLayoutEffect(() => {
    if (html && preRef.current?.firstChild) setReady(true)
  }, [html])

  const reducedMotion = usePrefersReducedMotion()
  const finePointer = useFinePointer()
  const live = ready && !reducedMotion
  const seed = seedFrom(asset)
  const wantsReveal = !!effects?.reveal
  useAsciiReveal(frameRef, {
    ...opts(effects?.reveal),
    seed,
    enabled: live && wantsReveal,
    hold: wantsReveal && !live,
  })
  useAsciiLens(frameRef, {
    ...opts(effects?.lens),
    seed,
    enabled: live && finePointer && !!effects?.lens,
  })
  useAsciiShimmer(frameRef, {
    ...opts(effects?.shimmer),
    seed,
    enabled: live && !!effects?.shimmer,
  })

  return (
    <div
      ref={frameRef}
      role="img"
      aria-label={alt}
      translate="no"
      data-nosnippet=""
      data-cols={meta.cols}
      data-rows={meta.rows}
      data-reveal={effects?.reveal ? "" : undefined}
      data-tone={meta.ink > PHOTO_INK ? "photo" : "type"}
      className={cn("ascii-frame", className)}
      style={
        {
          "--ascii-cols": meta.cols,
          "--ascii-rows": meta.rows,
        } as CSSProperties
      }
    >
      <pre
        ref={preRef}
        aria-hidden="true"
        className="ascii-art"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: html ?? "" }}
      />
    </div>
  )
}
