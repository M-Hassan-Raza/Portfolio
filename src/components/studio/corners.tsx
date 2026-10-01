import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Four facts pinned to the corners of a cover, magazine style. */
export function Corners({
  top,
  bottom,
  className,
  children,
}: {
  top: [ReactNode, ReactNode]
  bottom: [ReactNode, ReactNode]
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-8 md:gap-12", className)}>
      <div className="flex items-start justify-between gap-6 type-label">
        <span>{top[0]}</span>
        <span className="text-right">{top[1]}</span>
      </div>
      {children}
      <div className="flex items-end justify-between gap-6 type-label">
        <span>{bottom[0]}</span>
        <span className="text-right">{bottom[1]}</span>
      </div>
    </div>
  )
}
