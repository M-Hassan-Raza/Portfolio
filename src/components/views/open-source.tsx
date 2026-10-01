import { ArrowUpRight, ChevronDown, GitMerge, Star } from "lucide-react"
import type { Document } from "#content"
import { curatedWork, openSource } from "#content"
import { formatDate, formatMonthYear } from "@/lib/format"
import { ContentBody } from "@/components/content/body"
import { BlockHero } from "@/components/studio/block-hero"
import { Settle } from "@/components/studio/motion"
import { SectionHeading } from "@/components/studio/section-heading"
import { StatBlock } from "@/components/studio/stat-block"
import { TiltCardAnchor } from "@/components/studio/tilt-card"

const numberFormat = new Intl.NumberFormat("en-US")

export function OpenSourceView({ document }: { document: Document }) {
  const highlights = curatedWork.items.map((highlight) => {
    const project = openSource.projects.find(
      (candidate) => candidate.repo === highlight.repo
    )
    const pr = project?.prs.find(
      (candidate) => candidate.number === highlight.number
    )
    if (!project || !pr)
      throw new Error(
        `Curated PR missing from generated records: ${highlight.repo}#${highlight.number}`
      )
    return { highlight, project, pr }
  })
  const withPrs = openSource.projects.filter(
    (project) => project.prs.length > 0
  )
  return (
    <div data-block="grass" className="flex flex-col gap-20 pb-24 sm:gap-24">
      <BlockHero
        block="grass"
        title={document.title}
        size="l"
        lede={document.description}
        aside={
          <StatBlock
            value={openSource.merged}
            label={`merged pull requests across ${openSource.projects.length} projects`}
            className="lg:justify-self-end"
          >
            <p className="font-serif text-[0.95rem]">
              Last refreshed from GitHub on{" "}
              <time dateTime={openSource.generated}>
                {formatDate(openSource.generated)}
              </time>
              .
            </p>
          </StatBlock>
        }
      />

      {document.content.trim() && (
        <div className="frame">
          <div className="max-w-read">
            <ContentBody code={document.mdx} />
          </div>
        </div>
      )}

      <section
        aria-labelledby="highlights"
        className="frame flex flex-col gap-10"
      >
        <SectionHeading
          id="highlights"
          title="The ones I’d point to"
          aside="Each card opens the pull request, diff and review thread."
        />
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {highlights.map(({ highlight, project, pr }, index) => (
            <Settle as="li" key={pr.url} index={index % 6}>
              <TiltCardAnchor
                href={pr.url}
                tiltIndex={index}
                className="flex h-full flex-col overflow-hidden bg-paper-raised text-ink"
              >
                <span className="flex items-center justify-between gap-3 border-b-2 border-ink px-6 py-4 transition-colors group-hover:bg-block group-hover:text-on-block">
                  <span className="truncate text-lg font-extrabold tracking-[-0.03em]">
                    {project.name}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold tabular">
                    <Star
                      aria-hidden="true"
                      className="size-3.5"
                      strokeWidth={2.6}
                    />
                    {numberFormat.format(project.stars)}
                  </span>
                </span>
                <span className="flex flex-1 flex-col gap-3 p-6">
                  <span className="type-label text-ink-soft tabular">
                    #{highlight.number}
                  </span>
                  <span className="type-h3">{highlight.title}</span>
                  <span className="font-serif leading-relaxed text-ink-soft">
                    {highlight.note}
                  </span>
                  <span className="mt-auto flex items-center justify-between gap-3 pt-3 text-sm font-bold">
                    <span className="text-ink-soft">
                      {project.language ?? "Mixed"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      View on GitHub
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-300 ease-(--ease-pop) group-hover:rotate-45"
                      />
                    </span>
                  </span>
                </span>
              </TiltCardAnchor>
            </Settle>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="everything"
        className="frame flex flex-col gap-10"
      >
        <SectionHeading
          id="everything"
          title="Everything, by project"
          aside="Open a repo for the full list of merged work."
        />
        <ul className="flex flex-col border-t-2 border-ink">
          {withPrs.map((project) => (
            <li key={project.repo} className="border-b-2 border-ink">
              <details className="group/repo">
                <summary className="wipe flex cursor-pointer list-none items-center gap-4 px-3 py-4 md:px-5 [&::-webkit-details-marker]:hidden">
                  <GitMerge
                    aria-hidden="true"
                    className="size-5 shrink-0"
                    strokeWidth={2.4}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
                    <span className="truncate text-[1.35rem] font-extrabold tracking-[-0.03em]">
                      {project.name}
                    </span>
                    <span className="wipe-soft truncate font-serif text-ink-soft">
                      {project.blurb ?? project.repo}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold tabular">
                    {project.merged} merged
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 transition-transform duration-300 group-open/repo:rotate-180"
                  />
                </summary>
                <ol className="flex flex-col gap-0.5 px-1 pt-1 pb-4 md:px-3">
                  {project.prs.map((pr) => (
                    <li key={pr.number}>
                      <a
                        href={pr.url}
                        className="flex items-baseline justify-between gap-4 rounded-md px-3 py-2 font-serif text-[1rem] text-ink hover:bg-paper-sunk"
                      >
                        <span>{pr.title}</span>
                        <time
                          dateTime={pr.merged}
                          className="shrink-0 font-sans text-sm font-semibold text-ink-soft tabular"
                        >
                          {formatMonthYear(pr.merged)}
                        </time>
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
