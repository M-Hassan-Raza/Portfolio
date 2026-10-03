import { ArrowUpRight } from "lucide-react"
import type { Document } from "@/lib/content/types"
import { formatDate, formatReadingTime, yearOf } from "@/lib/format"
import { blockFor } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { CoverFrame } from "@/components/studio/cover-card"
import type { IndexRow } from "@/components/studio/index-list"
import { MetaPill, Stamp } from "@/components/studio/tag"
import { TiltCardLink } from "@/components/studio/tilt-card"

type Project = Extract<Document, { kind: "project" }>

function Arrow() {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-ink text-paper transition-transform duration-300 ease-(--ease-pop) group-hover:rotate-45">
      <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2.6} />
    </span>
  )
}

/**
 * A tilted sticker card for one project. At rest the cover prints in ink;
 * touch it and it floods with the project's own colour.
 */
export function ProjectCard({
  project,
  note,
  index,
  lead = false,
  className,
}: {
  project: Project
  note?: string
  index: number
  lead?: boolean
  className?: string
}) {
  const slug = project.path.split("/")[2] ?? "x"
  return (
    <TiltCardLink
      to={project.path}
      tiltIndex={index}
      tilt={lead ? -1 : undefined}
      block={blockFor(project.path)}
      className={cn(
        "relative flex h-full flex-col bg-paper-raised p-2.5 text-ink",
        lead && "md:grid md:grid-cols-[1.35fr_1fr] md:items-stretch md:gap-2",
        className
      )}
    >
      <CoverFrame
        asset={project.cover?.ascii}
        alt={project.cover?.alt ?? project.title}
        transitionName={`cover-${slug}`}
        aspect={
          lead
            ? "aspect-[16/10] md:aspect-auto md:h-full md:min-h-80"
            : "aspect-[16/10]"
        }
      />
      <div
        className={cn(
          "flex flex-1 flex-col gap-3 p-4 pt-5",
          lead && "md:justify-end md:p-7"
        )}
      >
        {project.projectLabel && (
          <p className="type-label text-ink-soft">{project.projectLabel}</p>
        )}
        <h3 className={cn(lead ? "type-h2" : "type-h3 text-[1.6rem]")}>
          {project.title}
        </h3>
        <p
          className={cn(
            "font-serif text-ink-soft",
            lead
              ? "text-[1.2rem] leading-snug"
              : "line-clamp-3 text-[1rem] leading-relaxed"
          )}
        >
          {note ?? project.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          {project.facts?.timeline ? (
            <MetaPill>{project.facts.timeline}</MetaPill>
          ) : (
            project.publishedAt && (
              <MetaPill>{yearOf(project.publishedAt)}</MetaPill>
            )
          )}
          <span className="ml-auto">
            <Arrow />
          </span>
        </div>
      </div>
      {lead && project.facts?.status && (
        <Stamp rotate={6} className="absolute -top-4 right-6">
          {project.facts.status}
        </Stamp>
      )}
    </TiltCardLink>
  )
}

/** One essay as a tilted card: title, one line, date. */
export function EssayCard({
  entry,
  note,
  index,
  number,
  className,
}: {
  entry: Document
  note?: string
  index: number
  number?: number
  className?: string
}) {
  return (
    <TiltCardLink
      to={entry.path}
      tiltIndex={index}
      block={blockFor(entry.path)}
      className={cn(
        "flex h-full flex-col gap-4 bg-paper-raised p-6 text-ink",
        className
      )}
    >
      {number !== undefined && (
        <span className="type-numeral text-[4rem] transition-colors group-hover:text-block-text">
          {number}
        </span>
      )}
      <span className="type-h3 text-[1.45rem]">{entry.title}</span>
      <span className="font-serif text-[1rem] leading-relaxed text-ink-soft">
        {note ?? entry.description}
      </span>
      <span className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="text-sm font-semibold text-ink-soft">
          {entry.publishedAt ? formatDate(entry.publishedAt) : ""}
        </span>
        <Arrow />
      </span>
    </TiltCardLink>
  )
}

/** An essay or page as a row for the hover-flood index. */
export function entryRow(entry: Document, note?: string): IndexRow {
  const meta = [
    entry.publishedAt ? formatDate(entry.publishedAt) : null,
    entry.readingMinutes
      ? `${formatReadingTime(entry.readingMinutes)} read`
      : null,
  ]
    .filter(Boolean)
    .join(" · ")
  return {
    key: entry.path,
    href: entry.path,
    title: entry.title,
    label: entry.title,
    block: blockFor(entry.path),
    meta: meta || undefined,
    note: note ?? entry.description,
    cover: entry.cover && !entry.cover.hidden ? entry.cover.ascii : undefined,
  }
}
