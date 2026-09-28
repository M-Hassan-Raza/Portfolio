import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Rocket, Sparkles } from "lucide-react"
import type { Document } from "#content"
import { formatDate, formatReadingTime, yearOf } from "@/lib/format"
import { hashOf, hues } from "@/lib/studio"
import type { Hue } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { CoverMat } from "@/components/studio/cover-mat"
import { Shape, shapeNames } from "@/components/studio/shape"
import { MetaPill, Sticker } from "@/components/studio/sticker"
import { TiltCardLink } from "@/components/studio/tilt-card"

type Project = Extract<Document, { kind: "project" }>

const matHues: Hue[] = ["lilac", "butter", "mint", "sky", "peach", "rose"]
export function matHueAt(index: number): Hue {
  return matHues[index % matHues.length] ?? "lilac"
}

/** A tilted sticker card for one project. The whole card is the link. */
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
  const status = project.facts?.status
  const live = status ? /production|use|live/i.test(status) : false
  return (
    <TiltCardLink
      to={project.path}
      tiltIndex={index}
      tilt={lead ? -1 : undefined}
      className={cn(
        "relative flex h-full flex-col bg-paper-raised p-3",
        lead && "md:grid md:grid-cols-[1.25fr_1fr] md:items-stretch md:gap-2",
        className
      )}
    >
      <CoverMat
        asset={project.cover?.ascii}
        alt={project.cover?.alt ?? project.title}
        seed={project.path}
        hue={matHueAt(index)}
        transitionName={`cover-${project.path.split("/")[2] ?? "x"}`}
        aspect={
          lead ? "aspect-[16/10] md:aspect-auto md:h-full" : "aspect-[16/10]"
        }
        frameClassName={lead ? "md:min-h-80" : undefined}
      />
      <div
        className={cn(
          "flex flex-1 flex-col gap-3 p-4 pt-5",
          lead && "md:justify-end md:p-7"
        )}
      >
        {project.projectLabel && (
          <p className="type-label text-ink-faint">{project.projectLabel}</p>
        )}
        <h3 className={cn("text-ink", lead ? "type-h2" : "type-h3")}>
          {project.title}
        </h3>
        <p
          className={cn(
            "text-ink-soft",
            lead
              ? "type-lede text-[1.2rem]"
              : "line-clamp-3 text-[0.95rem] leading-relaxed"
          )}
        >
          {note ?? project.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          {project.facts?.timeline ? (
            <MetaPill tone="sunk">{project.facts.timeline}</MetaPill>
          ) : (
            project.publishedAt && (
              <MetaPill tone="sunk">{yearOf(project.publishedAt)}</MetaPill>
            )
          )}
          <span className="ml-auto grid size-9 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 ease-(--ease-pop) group-hover:rotate-45">
            <ArrowUpRight
              aria-hidden="true"
              className="size-4"
              strokeWidth={2.4}
            />
          </span>
        </div>
      </div>
      {status && (
        <Sticker
          icon={live ? Rocket : Sparkles}
          hue={live ? "mint" : "butter"}
          rotate={index % 2 === 0 ? 8 : -9}
          className="absolute -top-3 -right-3"
        >
          {status}
        </Sticker>
      )}
    </TiltCardLink>
  )
}

/** One essay as a raised paper row with a pastel shape stamp. */
export function EssayRow({
  entry,
  note,
  hue = "peach",
  className,
}: {
  entry: Document
  note?: string
  hue?: Hue
  className?: string
}) {
  const hash = hashOf(entry.path)
  const shape = shapeNames[hash % shapeNames.length] ?? "circle"
  const stampHue = hue === "peach" ? (hues[hash % hues.length] ?? "peach") : hue
  return (
    <Link
      to={entry.path}
      className={cn(
        "group grid grid-cols-[3.25rem_1fr] items-start gap-x-5 gap-y-3 rounded-lg bg-paper-raised p-5 transition-[transform,box-shadow,background-color] duration-300 ease-(--ease-settle) hover:-translate-y-0.5 hover:shadow-soft sm:grid-cols-[4rem_1fr_auto] sm:p-6",
        className
      )}
    >
      <span
        data-hue={stampHue}
        className="block size-13 text-hue transition-transform duration-500 ease-(--ease-pop) group-hover:scale-110 group-hover:rotate-12 sm:size-16"
      >
        <Shape name={shape} className="size-full" />
      </span>
      <span className="flex min-w-0 flex-col gap-2">
        <span className="type-serif-title text-[1.35rem] text-ink sm:text-[1.5rem]">
          {entry.title}
        </span>
        <span className="line-clamp-2 text-[0.95rem] leading-relaxed text-ink-soft">
          {note ?? entry.description}
        </span>
      </span>
      <span className="col-start-2 flex flex-wrap items-center gap-2 text-sm text-ink-faint tabular sm:col-start-3 sm:flex-col sm:items-end sm:gap-1 sm:pt-1.5">
        {entry.publishedAt && (
          <time
            dateTime={entry.publishedAt}
            className="font-medium text-ink-soft"
          >
            {formatDate(entry.publishedAt)}
          </time>
        )}
        <span>{formatReadingTime(entry.readingMinutes)} read</span>
      </span>
    </Link>
  )
}
