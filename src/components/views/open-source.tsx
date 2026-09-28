import { ArrowUpRight, ChevronDown, GitMerge, Star } from "lucide-react"
import type { Document } from "#content"
import { curatedWork, openSource } from "#content"
import { formatDate, formatMonthYear } from "@/lib/format"
import { hues } from "@/lib/studio"
import type { Hue } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { ContentBody } from "@/components/content/body"
import { Settle } from "@/components/studio/motion"
import { PageHero } from "@/components/studio/page-hero"
import { SectionHeading } from "@/components/studio/section-heading"
import { bandShapes } from "@/components/studio/shape-presets"
import { Sticker } from "@/components/studio/sticker"
import { TiltCardAnchor } from "@/components/studio/tilt-card"
import { headlineFor } from "./headlines"

const numberFormat = new Intl.NumberFormat("en-US")
const repoHue = (index: number): Hue =>
  hues[(index + 3) % hues.length] ?? "mint"

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
    <div data-hue="mint" className="flex flex-col gap-20 pb-8 sm:gap-24">
      <PageHero
        hue="mint"
        title={document.title}
        headline={headlineFor(document.path, document.title)}
        lede={document.description}
        shapes={bandShapes("mint", 0).slice(1)}
        aside={
          <dl className="grid grid-cols-2 gap-3 lg:justify-self-end">
            <div className="flex flex-col gap-1 rounded-lg bg-paper-raised p-5 sm:p-6">
              <dt className="order-2 text-sm font-medium text-ink-soft">
                merged pull requests
              </dt>
              <dd className="type-numeral text-[clamp(3.5rem,6vw,5.5rem)] text-ink">
                {openSource.merged}
              </dd>
            </div>
            <div className="flex flex-col gap-1 rounded-lg bg-paper-raised p-5 sm:p-6">
              <dt className="order-2 text-sm font-medium text-ink-soft">
                projects
              </dt>
              <dd className="type-numeral text-[clamp(3.5rem,6vw,5.5rem)] text-ink">
                {openSource.projects.length}
              </dd>
            </div>
            <p className="col-span-2 text-sm text-ink-soft">
              Last refreshed from GitHub on{" "}
              <time dateTime={openSource.generated}>
                {formatDate(openSource.generated)}
              </time>
              .
            </p>
          </dl>
        }
      />

      <div className="frame flex flex-col gap-20 sm:gap-24">
        <div className="max-w-read">
          <ContentBody code={document.mdx} />
        </div>

        <section aria-labelledby="highlights" className="flex flex-col gap-10">
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
                  tilt={0}
                  hue={repoHue(index)}
                  className="flex h-full flex-col overflow-hidden bg-paper-raised"
                >
                  <div className="flex items-center justify-between gap-3 bg-hue px-6 py-4 text-on-pastel">
                    <span className="truncate text-lg font-bold tracking-[-0.02em]">
                      {project.name}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold tabular">
                      <Star
                        aria-hidden="true"
                        className="size-3.5"
                        strokeWidth={2.4}
                      />
                      {numberFormat.format(project.stars)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 border-t-[1.5px] border-ink p-6">
                    <p className="type-label text-ink-faint tabular">
                      #{highlight.number}
                    </p>
                    <h3 className="type-h3 text-ink">{highlight.title}</h3>
                    <p className="leading-relaxed text-ink-soft">
                      {highlight.note}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-sm font-semibold text-ink">
                      <span className="text-ink-faint">
                        {project.language ?? "Mixed"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        View on GitHub
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-4 transition-transform duration-300 ease-(--ease-pop) group-hover:rotate-45"
                        />
                      </span>
                    </div>
                  </div>
                </TiltCardAnchor>
              </Settle>
            ))}
          </ul>
        </section>

        <section aria-labelledby="everything" className="flex flex-col gap-10">
          <SectionHeading
            id="everything"
            title="Everything, by project"
            aside="Open a repo for the full list of merged work."
          />
          <ul className="columns-1 gap-6 md:columns-2">
            {withPrs.map((project, index) => (
              <li
                key={project.repo}
                data-hue={repoHue(index)}
                className="break-inside-avoid pb-6"
              >
                <details className="group/repo overflow-hidden rounded-lg bg-paper-raised">
                  <summary className="flex cursor-pointer list-none items-center gap-4 p-5 hover:bg-hue-tint [&::-webkit-details-marker]:hidden">
                    <span className="grid size-11 shrink-0 place-items-center rounded-md bg-hue text-on-pastel">
                      <GitMerge
                        aria-hidden="true"
                        className="size-5"
                        strokeWidth={2.2}
                      />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-bold text-ink">
                        {project.name}
                      </span>
                      <span className="truncate text-sm text-ink-soft">
                        {project.blurb ?? project.repo}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-hue-tint px-3 py-1 text-sm font-semibold text-hue-deep tabular">
                      {project.merged} merged
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className="size-5 shrink-0 text-ink-soft transition-transform duration-300 group-open/repo:rotate-180"
                    />
                  </summary>
                  <ol className="flex flex-col gap-1 px-3 pb-4">
                    {project.prs.map((pr) => (
                      <li key={pr.number}>
                        <a
                          href={pr.url}
                          className="flex items-baseline justify-between gap-4 rounded-md px-3 py-2 text-[0.95rem] text-ink hover:bg-paper-sunk"
                        >
                          <span>{pr.title}</span>
                          <time
                            dateTime={pr.merged}
                            className="shrink-0 text-sm text-ink-faint tabular"
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
          <ul
            aria-label="Where the pull requests landed"
            className="flex flex-wrap justify-center gap-3 pt-4"
          >
            {withPrs.map((project, index) => (
              <li key={project.repo}>
                <Sticker
                  icon={GitMerge}
                  hue={repoHue(index)}
                  rotate={[-6, 4, -3, 7, -8, 2][index % 6]}
                  className={cn("text-[0.8125rem]")}
                >
                  {project.name} · {project.merged}
                </Sticker>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
