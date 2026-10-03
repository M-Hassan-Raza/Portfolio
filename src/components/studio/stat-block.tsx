import type { CSSProperties, ReactNode } from "react"
import { useEnter } from "@/lib/enter"
import { cn } from "@/lib/utils"
import { shapeNames, Shape } from "./shape"

/**
 * A big chunky numeral and a grid of exactly N little shapes (capped at 24,
 * with a plus beyond), in one ink. The numeral counts up and the shapes pop
 * in once, when the block scrolls into view. All CSS ("Entrances" in
 * styles.css): the count is a registered custom property feeding a counter,
 * so the real number stays in the HTML and nothing re-renders per frame.
 */
export function StatBlock({
  value,
  suffix = "",
  label,
  children,
  className,
}: {
  value: number
  suffix?: string
  label: ReactNode
  children?: ReactNode
  className?: string
}) {
  const enter = useEnter<HTMLDivElement>()
  const count = Math.min(value, 24)
  return (
    <div {...enter} className={cn("stat-block flex flex-col gap-6", className)}>
      <p
        className="type-numeral text-[clamp(6rem,15vw,13rem)] text-block-deep"
        aria-label={`${value}${suffix}`}
      >
        <span aria-hidden="true">
          <span
            className="stat-count"
            style={{ "--stat-to": value } as CSSProperties}
          >
            <span className="stat-value">{value}</span>
          </span>
          {suffix}
        </span>
      </p>
      <p className="max-w-[18rem] type-h3">{label}</p>
      <ul
        aria-hidden="true"
        className="grid max-w-[26rem] grid-cols-8 gap-1.5 text-block-deep"
      >
        {Array.from({ length: count }, (_, index) => {
          const name =
            shapeNames[(index * 5 + value) % shapeNames.length] ?? "circle"
          return (
            <li
              key={index}
              className="stat-shape aspect-square"
              style={{ "--stat-i": index } as CSSProperties}
            >
              <Shape name={name} className="size-full" />
            </li>
          )
        })}
        {value > 24 && (
          <li className="grid aspect-square place-items-center rounded-full bg-block-deep text-sm font-extrabold text-block">
            +
          </li>
        )}
      </ul>
      {children}
    </div>
  )
}
