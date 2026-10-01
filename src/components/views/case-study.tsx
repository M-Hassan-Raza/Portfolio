import { Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import type { ReactNode } from "react"
import type { Document } from "#content"
import { projects } from "@/lib/content/catalog"
import { padIndex, yearOf } from "@/lib/format"
import { blockFor, page } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { Comments } from "@/components/content/comments"
import { Corners } from "@/components/studio/corners"
import { CoverFrame } from "@/components/studio/cover-card"
import { FitText } from "@/components/studio/fit-text"
import { Settle } from "@/components/studio/motion"
import { TiltCard } from "@/components/studio/tilt-card"
import { NextBlock, ReadingLayout, TagRow } from "./article"

type Project = Extract<Document, { kind: "project" }>

/**
 * A case study opens like a magazine cover: the project's own block, its name
 * poured edge to edge in tone-on-tone, facts in the four corners, and the
 * cover breaking out of the bottom as a tilted card.
 */
export function CaseStudyView({ document }: { document: Project }) {
  const block = blockFor(document.path)
  const index = projects.findIndex((entry) => entry.path === document.path)
  const next = projects[(index + 1) % projects.length]
  const facts = document.facts
  const slug = document.path.split("/")[2] ?? "x"
  const cover = document.cover && !document.cover.hidden ? document.cover : null
  const short = document.title.length <= 12
  const year = document.publishedAt ? yearOf(document.publishedAt) : ""
  return (
    <article className="flex flex-col">
      <header data-block={block} className="surface-block">
        <div
          className={cn(
            "frame flex flex-col gap-10 pt-28 sm:pt-32",
            cover ? "pb-0" : "pb-16"
          )}
        >
          <Corners
            top={[
              <Link
                key="back"
                to={page("/projects/")}
                className="underline-offset-4 hover:underline"
              >
                Case study {padIndex(index + 1)}, all work
              </Link>,
              document.projectLabel ?? "Project",
            ]}
            bottom={[facts?.timeline ?? year, facts?.status ?? "Shipped"]}
          >
            <h1 className="text-block-deep">
              {short ? (
                <FitText text={document.title} rise />
              ) : (
                <span className="block type-display-xl text-[clamp(3.5rem,9vw,9rem)]">
                  {document.title}
                </span>
              )}
            </h1>
          </Corners>
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-end">
            <p className="max-w-[36rem] type-lede">{document.description}</p>
            {facts?.role && (
              <p className="flex flex-col gap-1 md:items-end md:text-right">
                <span className="type-label">Role</span>
                <span className="type-h3">{facts.role}</span>
              </p>
            )}
          </div>
          {cover && (
            <div className="grid md:grid-cols-12">
              <figure className="-mb-20 rotate-[-1.5deg] rounded-xl border-2 border-ink bg-paper-raised p-2 shadow-rest md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
                <CoverFrame
                  asset={cover.ascii}
                  alt={cover.alt}
                  tone="deep"
                  dense={!!cover.screen}
                  aspect={cover.screen ? "aspect-[16/9]" : "aspect-[16/10]"}
                  transitionName={`cover-${slug}`}
                />
              </figure>
            </div>
          )}
        </div>
      </header>
      {cover?.caption && (
        <p className="frame pt-24 text-center font-serif text-[0.95rem] text-ink-soft">
          {cover.caption}
        </p>
      )}

      <div
        data-block={block}
        className={cn(
          "flex flex-col gap-16 pb-24 sm:gap-20",
          cover && !cover.caption ? "pt-32" : "pt-14"
        )}
      >
        {facts && (
          <dl className="frame grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
            <Fact label="Team">{facts.team}</Fact>
            <Fact label="Timeline">{facts.timeline}</Fact>
            <Fact label="Stack">{facts.stack?.join(", ")}</Fact>
            <Fact label="Source">
              {facts.source &&
                (facts.source.url ? (
                  <a
                    href={facts.source.url}
                    className="inline-flex items-center gap-1 underline decoration-2 underline-offset-4"
                  >
                    {facts.source.label}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                ) : (
                  facts.source.label
                ))}
            </Fact>
          </dl>
        )}

        {document.outcomes.length > 0 && (
          <section
            aria-labelledby="outcomes"
            className="frame flex flex-col gap-8"
          >
            <h2 id="outcomes" className="type-h2">
              What came of it
            </h2>
            <ol className="grid gap-6 md:grid-cols-3">
              {document.outcomes.map((outcome, position) => (
                <Settle as="li" key={outcome} index={position}>
                  <TiltCard
                    tiltIndex={position}
                    className="flex h-full flex-col gap-4 bg-paper-raised p-6 text-ink"
                  >
                    <span className="type-numeral text-[3.5rem] text-block-text">
                      {padIndex(position + 1)}
                    </span>
                    <span className="font-serif text-[1.1rem] leading-snug">
                      {outcome}
                    </span>
                  </TiltCard>
                </Settle>
              ))}
            </ol>
          </section>
        )}

        <ReadingLayout
          document={document}
          after={
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-5 border-t-2 border-ink pt-6">
                <p className="type-h3">End of case study.</p>
                <TagRow tags={document.tags} />
              </div>
              {document.comments && <Comments path={document.path} />}
            </div>
          }
        />
      </div>

      {next && next.path !== document.path && (
        <NextBlock kind="Next project" next={next} />
      )}
    </article>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  if (!children) return null
  return (
    <div className="flex flex-col gap-1.5 border-t-2 border-ink pt-3">
      <dt className="type-label text-ink-soft">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  )
}
