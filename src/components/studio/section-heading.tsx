import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Section title with an optional italic aside and a quiet "see all" link. */
export function SectionHeading({
  title,
  aside,
  link,
  id,
  className,
}: {
  title: ReactNode
  aside?: ReactNode
  link?: { to: string; label: string }
  id?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-8 gap-y-3",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <h2 id={id} className="type-h2 text-ink">
          {title}
        </h2>
        {aside && (
          <p className="type-annotation text-lg text-ink-soft">{aside}</p>
        )}
      </div>
      {link && <ArrowLink to={link.to}>{link.label}</ArrowLink>}
    </div>
  )
}

export function ArrowLink({
  to,
  children,
  className,
}: {
  to: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full bg-paper-raised py-2 pr-3 pl-4 text-sm font-semibold text-ink shadow-soft transition-colors hover:bg-hue-tint",
        className
      )}
    >
      {children}
      <span className="grid size-6 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 ease-(--ease-pop) group-hover:translate-x-0.5 group-hover:rotate-[-8deg]">
        <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={2.6} />
      </span>
    </Link>
  )
}
