import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import type { BlockName } from "@/lib/studio"
import { useFinePointer, usePrefersReducedMotion } from "@/lib/ascii/media"
import { preloadArt } from "@/components/ascii/ascii-art"
import { cn } from "@/lib/utils"
import { CoverFrame, coverAsset } from "./cover-card"

export type IndexRow = {
  key: string
  href: string
  title: ReactNode
  /** Plain title for the floating cover's alt text. */
  label: string
  block: BlockName
  year?: string
  meta?: ReactNode
  note?: ReactNode
  cover?: string
  external?: boolean
}

/**
 * Titles stacked tight between ink rules. Hovering (or focusing) a row floods
 * it with that piece's own colour and floats its cover, as a tilted sticker,
 * near the cursor. Touch devices just tap through.
 *
 * Hover only re-renders the floating cover, never the rows, and the cover is
 * placed from one animation frame that reads layout before it writes.
 */
export function IndexList({
  rows,
  size = "large",
  className,
}: {
  rows: IndexRow[]
  size?: "large" | "compact"
  className?: string
}) {
  const listRef = useRef<HTMLUListElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<IndexRow | null>(null)
  const finePointer = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const current = useRef<{ x: number; y: number } | null>(null)
  const frame = useRef(0)

  const showThumbs = finePointer && rows.some((row) => row.cover)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function place() {
    frame.current = 0
    const list = listRef.current
    const thumb = thumbRef.current
    if (!list || !thumb || !pointer.current) return
    // Reads first, then the one write.
    const box = list.getBoundingClientRect()
    const width = thumb.offsetWidth
    const height = thumb.offsetHeight
    const target = {
      x: Math.min(
        Math.max(pointer.current.x - box.left + 32, 0),
        box.width - width
      ),
      y: Math.min(
        Math.max(pointer.current.y - box.top - height / 2, 0),
        box.height - height
      ),
    }
    const ease = reduced ? 1 : 0.16
    const from = current.current ?? target
    const next = {
      x: from.x + (target.x - from.x) * ease,
      y: from.y + (target.y - from.y) * ease,
    }
    current.current = next
    thumb.style.transform = `translate3d(${next.x.toFixed(1)}px, ${next.y.toFixed(1)}px, 0)`
    const settled =
      Math.abs(target.x - next.x) < 0.5 && Math.abs(target.y - next.y) < 0.5
    if (!settled) frame.current = requestAnimationFrame(place)
  }

  function onMove(event: React.PointerEvent) {
    if (!showThumbs) return
    pointer.current = { x: event.clientX, y: event.clientY }
    if (!frame.current) frame.current = requestAnimationFrame(place)
  }

  const onEnter = useCallback((row: IndexRow) => setActive(row), [])

  return (
    <ul
      ref={listRef}
      onPointerEnter={() => {
        if (!showThumbs) return
        for (const row of rows) if (row.cover) preloadArt(coverAsset(row.cover))
      }}
      onPointerMove={onMove}
      onPointerLeave={() => {
        setActive(null)
        current.current = null
      }}
      className={cn("relative border-t-2 border-ink", className)}
    >
      {rows.map((row) => (
        <Row key={row.key} row={row} size={size} onEnter={onEnter} />
      ))}
      {showThumbs && (
        <div
          ref={thumbRef}
          aria-hidden="true"
          data-block={active?.block}
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-dropdown w-[14rem] transition-opacity duration-150",
            active?.cover ? "opacity-100" : "opacity-0"
          )}
        >
          {active?.cover && (
            <div className="-rotate-3 rounded-xl border-2 border-ink bg-paper-raised p-1.5 shadow-rest">
              <CoverFrame
                asset={active.cover}
                alt={active.label}
                aspect="aspect-[16/11]"
              />
            </div>
          )}
        </div>
      )}
    </ul>
  )
}

const Row = memo(function IndexListRow({
  row,
  size,
  onEnter,
}: {
  row: IndexRow
  size: "large" | "compact"
  onEnter: (row: IndexRow) => void
}) {
  return (
    <li
      data-block={row.block}
      className="border-b-2 border-ink"
      onPointerEnter={() => onEnter(row)}
    >
      <RowLink row={row}>
        <span
          className={cn(
            "flex min-w-0 items-start gap-2",
            size === "large"
              ? "text-[clamp(1.9rem,3.4vw+0.6rem,3.5rem)] leading-[0.98] font-extrabold tracking-[-0.04em] [font-stretch:90%]"
              : "text-[clamp(1.35rem,1.4vw+0.8rem,1.9rem)] leading-[1.1] font-bold tracking-[-0.03em] [font-stretch:94%]"
          )}
          style={{ fontVariationSettings: '"opsz" 72' }}
        >
          <span className="min-w-0 text-balance">{row.title}</span>
          {row.year && (
            <span className="shrink-0 pt-[0.2em] type-label tabular">
              {row.year}
            </span>
          )}
        </span>
        {(row.meta || row.note) && (
          <span className="flex flex-col gap-1.5 md:items-end md:text-right">
            {row.meta && (
              <span className="wipe-soft type-label text-ink-soft">
                {row.meta}
              </span>
            )}
            {row.note && (
              <span className="wipe-soft max-w-[36ch] font-serif text-[0.975rem] leading-snug text-ink-soft">
                {row.note}
              </span>
            )}
          </span>
        )}
      </RowLink>
    </li>
  )
})

function RowLink({ row, children }: { row: IndexRow; children: ReactNode }) {
  const className =
    "wipe group grid items-start gap-x-8 gap-y-2 px-3 py-4 outline-offset-[-3px] md:grid-cols-[minmax(0,1fr)_auto] md:px-5 md:py-5"
  if (row.external)
    return (
      <a href={row.href} className={className}>
        {children}
        <ArrowUpRight
          aria-hidden="true"
          className="absolute top-4 right-3 size-4 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </a>
    )
  return (
    <Link to={row.href} className={className}>
      {children}
    </Link>
  )
}
