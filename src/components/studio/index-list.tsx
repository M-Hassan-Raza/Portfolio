import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import type { BlockName } from "@/lib/studio"
import { useFinePointer, usePrefersReducedMotion } from "@/lib/ascii/media"
import { cn } from "@/lib/utils"
import { CoverFrame } from "./cover-card"

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
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const frame = useRef(0)

  const showThumbs = finePointer && rows.some((row) => row.cover)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function place() {
    const thumb = thumbRef.current
    if (!thumb) return
    const ease = reduced ? 1 : 0.16
    current.current.x += (target.current.x - current.current.x) * ease
    current.current.y += (target.current.y - current.current.y) * ease
    thumb.style.transform = `translate3d(${current.current.x.toFixed(1)}px, ${current.current.y.toFixed(1)}px, 0)`
    const settled =
      Math.abs(target.current.x - current.current.x) < 0.5 &&
      Math.abs(target.current.y - current.current.y) < 0.5
    frame.current = settled ? 0 : requestAnimationFrame(place)
  }

  function onMove(event: React.PointerEvent) {
    const list = listRef.current
    const thumb = thumbRef.current
    if (!list || !thumb || !showThumbs) return
    const box = list.getBoundingClientRect()
    const width = thumb.offsetWidth
    const height = thumb.offsetHeight
    const x = Math.min(
      Math.max(event.clientX - box.left + 32, 0),
      box.width - width
    )
    const y = Math.min(
      Math.max(event.clientY - box.top - height / 2, 0),
      box.height - height
    )
    const first = !active
    target.current = { x, y }
    if (first) current.current = { x, y }
    if (!frame.current) frame.current = requestAnimationFrame(place)
  }

  return (
    <ul
      ref={listRef}
      onPointerMove={onMove}
      onPointerLeave={() => setActive(null)}
      className={cn("relative border-t-2 border-ink", className)}
    >
      {rows.map((row) => (
        <li
          key={row.key}
          data-block={row.block}
          className="border-b-2 border-ink"
          onPointerEnter={() => setActive(row)}
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
