import { ArrowUpRight, Rocket, Sparkles } from "lucide-react"
import type { Document } from "#content"
import { projects } from "@/lib/content/catalog"
import { ProjectCard, matHueAt } from "@/components/content/cards"
import { Comments } from "@/components/content/comments"
import { CoverMat } from "@/components/studio/cover-mat"
import { Settle } from "@/components/studio/motion"
import { Band } from "@/components/studio/page-hero"
import { PillAnchor } from "@/components/studio/pill"
import { Shape, shapeNames } from "@/components/studio/shape"
import { MetaPill, Sticker } from "@/components/studio/sticker"
import { BackLink, ReadingLayout, TagRow } from "./article"

type Project = Extract<Document, { kind: "project" }>

export function CaseStudyView({ document }: { document: Project }) {
  const index = projects.findIndex((entry) => entry.path === document.path)
  const next = projects[index + 1] ?? projects[0]
  const facts = document.facts
  const status = facts?.status
  const live = status ? /production|use|live/i.test(status) : false
  const slug = document.path.split("/")[2] ?? "x"
  return (
    <article data-hue="lilac" className="flex flex-col gap-16 pb-8 sm:gap-20">
      <Band hue="lilac" innerClassName="gap-10 pb-16 sm:pb-20">
        <header className="flex max-w-4xl flex-col gap-5">
          <BackLink to="/projects/">All work</BackLink>
          {document.projectLabel && (
            <p className="type-label text-sm text-hue-deep">
              {document.projectLabel}
            </p>
          )}
          <h1 className="type-display text-ink">{document.title}</h1>
          <p className="max-w-2xl type-lede text-ink-soft">
            {document.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {facts?.role && <MetaPill>{facts.role}</MetaPill>}
            {facts?.timeline && <MetaPill>{facts.timeline}</MetaPill>}
            {facts?.team && <MetaPill>{facts.team}</MetaPill>}
            {status && (
              <Sticker
                icon={live ? Rocket : Sparkles}
                hue={live ? "mint" : "butter"}
                rotate={-4}
              >
                {status}
              </Sticker>
            )}
            {facts?.source?.url && (
              <PillAnchor href={facts.source.url} size="sm">
                {facts.source.label}
                <ArrowUpRight aria-hidden="true" />
              </PillAnchor>
            )}
          </div>
        </header>
        {document.cover && !document.cover.hidden && (
          <div className="relative">
            <CoverMat
              asset={document.cover.ascii}
              alt={document.cover.alt}
              seed={document.path}
              hue={matHueAt(Math.max(index, 0))}
              aspect="aspect-[16/10] sm:aspect-[21/9]"
              transitionName={`cover-${slug}`}
              className="-rotate-1 border-[1.5px] border-ink bg-paper-raised shadow-rest"
            />
            {document.cover.caption && (
              <p className="pt-4 text-sm text-ink-soft">
                {document.cover.caption}
              </p>
            )}
          </div>
        )}
      </Band>

      {(document.outcomes.length > 0 || facts) && (
        <section
          aria-label="At a glance"
          className="frame grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
        >
          {document.outcomes.length > 0 && (
            <ul
              data-hue="butter"
              className="grid gap-4 rounded-2xl bg-hue-tint p-6 sm:grid-cols-3 sm:p-8"
            >
              <li className="flex flex-col gap-1 sm:col-span-3">
                <h2 className="type-h3 text-ink">What changed</h2>
              </li>
              {document.outcomes.map((outcome, position) => (
                <Settle
                  as="li"
                  key={outcome}
                  index={position}
                  className="flex flex-col gap-4 rounded-lg bg-paper-raised p-5"
                >
                  <span
                    data-hue={
                      (["peach", "lilac", "mint"] as const)[position % 3]
                    }
                    className="block size-10 text-hue"
                  >
                    <Shape
                      name={
                        shapeNames[(position * 3 + 1) % shapeNames.length] ??
                        "circle"
                      }
                      className="size-full"
                    />
                  </span>
                  <span className="text-[0.975rem] leading-relaxed text-ink">
                    {outcome}
                  </span>
                </Settle>
              ))}
            </ul>
          )}
          {facts && (
            <dl className="flex flex-col gap-5 rounded-2xl bg-paper-sunk p-6 sm:p-8">
              {facts.stack && facts.stack.length > 0 && (
                <div className="flex flex-col gap-3">
                  <dt className="type-label text-ink-faint">Stack</dt>
                  <dd className="flex flex-wrap gap-2">
                    {facts.stack.map((item) => (
                      <MetaPill key={item}>{item}</MetaPill>
                    ))}
                  </dd>
                </div>
              )}
              {facts.source && (
                <div className="flex flex-col gap-2">
                  <dt className="type-label text-ink-faint">Source</dt>
                  <dd className="font-medium text-ink">
                    {facts.source.url ? (
                      <a
                        href={facts.source.url}
                        className="underline decoration-hue-deep decoration-2 underline-offset-4"
                      >
                        {facts.source.label}
                      </a>
                    ) : (
                      facts.source.label
                    )}
                  </dd>
                </div>
              )}
              {facts.team && (
                <div className="flex flex-col gap-2">
                  <dt className="type-label text-ink-faint">Team</dt>
                  <dd className="font-medium text-ink">{facts.team}</dd>
                </div>
              )}
            </dl>
          )}
        </section>
      )}

      <ReadingLayout
        document={document}
        after={
          <div className="flex flex-col gap-14">
            <TagRow tags={document.tags} />
            {document.comments && <Comments path={document.path} />}
          </div>
        }
      />

      {next && next !== document && (
        <section
          aria-labelledby="next-project"
          className="frame flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2">
            <p className="type-label text-hue-deep">Up next</p>
            <h2 id="next-project" className="type-h2 text-ink">
              Another thing I built
            </h2>
          </div>
          <Settle>
            <ProjectCard project={next} index={index + 1} lead />
          </Settle>
        </section>
      )}
    </article>
  )
}
