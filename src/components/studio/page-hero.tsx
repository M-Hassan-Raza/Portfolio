import type { ReactNode } from "react"
import type { Hue } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { ShapeField } from "./shape-field"
import type { FieldShape } from "./shape-field"

/** The band's bottom edge: paper rising into the tint in one soft arc. */
export function BandArc({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "-mt-px block h-12 w-full text-hue-tint sm:h-20",
        className
      )}
      fill="currentColor"
    >
      <path d="M0 0 H1440 V90 C1060 -8 380 -8 0 90 Z" />
    </svg>
  )
}

/**
 * A full-bleed tint band that opens a page. Its shapes are cropped by the band
 * edges; its bottom edge is one convex arc. The top padding clears the
 * floating nav pill.
 */
export function Band({
  hue,
  shapes,
  children,
  className,
  innerClassName,
  arc = true,
}: {
  hue: Hue
  shapes?: readonly FieldShape[]
  children: ReactNode
  className?: string
  innerClassName?: string
  arc?: boolean
}) {
  return (
    <div data-hue={hue} className={cn("flex flex-col", className)}>
      <div className="relative isolate overflow-clip bg-hue-tint">
        {shapes && <ShapeField shapes={shapes} />}
        <div
          className={cn(
            "relative frame flex flex-col gap-8 pt-32 pb-12 sm:pt-40 sm:pb-16",
            innerClassName
          )}
        >
          {children}
        </div>
      </div>
      {arc && <BandArc />}
    </div>
  )
}

/**
 * Page opening: the h1 is the page's real title, set as a small hue-dotted
 * label; the big display line under it carries the swapped word.
 */
export function PageHero({
  hue,
  title,
  headline,
  lede,
  children,
  shapes,
  aside,
}: {
  hue: Hue
  title: string
  headline: ReactNode
  lede?: ReactNode
  children?: ReactNode
  shapes?: readonly FieldShape[]
  aside?: ReactNode
}) {
  return (
    <Band hue={hue} shapes={shapes}>
      <div
        className={cn(
          "grid items-end gap-10",
          aside && "lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
        )}
      >
        <div className="flex max-w-4xl flex-col gap-4">
          <h1 className="inline-flex items-center gap-2.5 type-label text-sm text-hue-deep">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-hue" />
            {title}
          </h1>
          <p className="type-display text-ink">{headline}</p>
          {lede && (
            <div className="max-w-2xl type-lede text-ink-soft">{lede}</div>
          )}
          {children && (
            <div className="flex flex-wrap items-center gap-3 pt-4">
              {children}
            </div>
          )}
        </div>
        {aside}
      </div>
    </Band>
  )
}
