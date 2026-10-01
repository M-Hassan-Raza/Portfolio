import type { ReactNode } from "react"
import type { Surface } from "@/lib/studio"
import { cn } from "@/lib/utils"

/** An empty state: one block, one tone-on-tone line, one sentence. */
export function EmptyBlock({
  block,
  title,
  children,
  className,
}: {
  block: Surface
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      data-block={block}
      className={cn(
        "surface-block flex flex-col gap-3 px-6 py-10 sm:px-10",
        className
      )}
    >
      <p className="type-display text-block-deep">{title}</p>
      <p className="type-lede">{children}</p>
    </div>
  )
}
