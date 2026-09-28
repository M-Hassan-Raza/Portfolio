import type { ElementType, ReactNode } from "react"
import type { Surface } from "@/lib/studio"
import { cn } from "@/lib/utils"

/**
 * A page opens on one full-bleed colour block with straight edges. The title
 * is set huge in the chunky face, tone-on-tone; the lede and actions sit in
 * the block's own type colour. The top padding clears the floating nav.
 */
export function BlockHero({
  block,
  kicker,
  title,
  lede,
  children,
  aside,
  size = "xl",
  heading: Heading = "h1",
  className,
}: {
  block: Surface
  kicker?: ReactNode
  title: ReactNode
  lede?: ReactNode
  children?: ReactNode
  aside?: ReactNode
  size?: "xl" | "l"
  heading?: ElementType
  className?: string
}) {
  return (
    <header data-block={block} className={cn("surface-block", className)}>
      <div
        className={cn(
          "frame grid gap-10 pt-32 pb-12 sm:pt-40 sm:pb-16",
          aside && "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end"
        )}
      >
        <div className="flex min-w-0 flex-col gap-6">
          {kicker && <div className="type-label">{kicker}</div>}
          <Heading
            className={cn(
              "text-block-deep",
              size === "xl"
                ? "text-[clamp(4rem,13vw,12.5rem)] leading-[0.84] font-extrabold tracking-[-0.055em] [font-stretch:86%]"
                : "type-display-xl"
            )}
            style={{ fontVariationSettings: '"opsz" 96' }}
          >
            {title}
          </Heading>
          {lede && (
            <div className="max-w-[40rem] type-lede text-on-block">{lede}</div>
          )}
          {children && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {children}
            </div>
          )}
        </div>
        {aside}
      </div>
    </header>
  )
}
