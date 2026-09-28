import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Section title with an optional Fraunces aside and one "see all" link. */
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
        "flex flex-wrap items-end justify-between gap-x-8 gap-y-4",
        className
      )}
    >
      <div className="flex max-w-2xl flex-col gap-2">
        <h2 id={id} className="type-h2">
          {title}
        </h2>
        {aside && <p className="type-lede text-[1.15rem]">{aside}</p>}
      </div>
      {link && <ArrowLink to={link.to}>{link.label}</ArrowLink>}
    </div>
  )
}

/** The obvious next click: a paper pill with an arrow that nudges on hover. */
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
        "pressable group inline-flex h-11 items-center gap-2.5 rounded-full border-2 border-ink bg-paper-raised pr-1.5 pl-5 text-[0.9375rem] font-semibold text-ink",
        className
      )}
    >
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 ease-(--ease-pop) group-hover:translate-x-0.5">
        <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2.6} />
      </span>
    </Link>
  )
}
