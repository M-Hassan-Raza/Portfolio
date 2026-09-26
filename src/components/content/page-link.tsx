import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

export function PageLink({
  path,
  children,
  className,
}: {
  path: string
  children: ReactNode
  className?: string
}) {
  return path === "/" ? (
    <Link to="/" className={className}>
      {children}
    </Link>
  ) : (
    <Link
      to="/$/"
      params={{ _splat: path.slice(1).replace(/\/$/, "") }}
      className={className}
    >
      {children}
    </Link>
  )
}
