import { use, useEffect, useMemo, useState } from "react"
import { loadBody } from "@/lib/content/bodies"
import { cn } from "@/lib/utils"

/**
 * A sticky rail of headings. Each dot fills in the piece's colour once you've
 * reached it; the current one grows a little. No left bar.
 */
export function TableOfContents({
  path,
  className,
}: {
  /** The document whose body (and headings) is on the page. */
  path: string
  className?: string
}) {
  const { headings } = use(loadBody(path))
  const items = useMemo(
    () => headings.filter((heading) => heading.depth === 2),
    [headings]
  )
  const [current, setCurrent] = useState(-1)

  useEffect(() => {
    const targets = items
      .map((heading) => window.document.getElementById(heading.id))
      .filter((element) => element !== null)
    if (targets.length === 0) return
    // The root reaches far above the viewport and stops 30% down it, so a
    // heading "intersects" once it has scrolled past that reading line. The
    // browser reports crossings; nothing is measured on scroll.
    const passed = new Set<number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = targets.indexOf(entry.target as HTMLElement)
          if (entry.isIntersecting) passed.add(index)
          else passed.delete(index)
        }
        setCurrent(passed.size ? Math.max(...passed) : -1)
      },
      { rootMargin: "100000px 0px -70% 0px" }
    )
    for (const target of targets) observer.observe(target)
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null
  return (
    <nav
      aria-label="On this page"
      className={cn("flex flex-col gap-4", className)}
    >
      <p className="type-label text-ink-soft">On this page</p>
      <ol className="flex flex-col gap-1">
        {items.map((heading, index) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              data-active={index === current ? "" : undefined}
              data-read={index < current ? "" : undefined}
              aria-current={index === current ? "location" : undefined}
              className="toc-link group flex items-start gap-3 rounded-md px-2 py-1.5 text-sm leading-snug text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink data-active:font-semibold data-active:text-ink"
            >
              <span
                aria-hidden="true"
                className="flex h-[1lh] shrink-0 items-center"
              >
                <span className="toc-dot size-2.5 rounded-full border-[1.5px] border-ink" />
              </span>
              {heading.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
