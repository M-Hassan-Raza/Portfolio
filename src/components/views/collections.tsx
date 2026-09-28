import { Link } from "@tanstack/react-router"
import { ArrowRight, ArrowUpRight, BookOpen, Rss } from "lucide-react"
import { useState } from "react"
import type { Document } from "#content"
import { articles, projects, requireDocument } from "@/lib/content/catalog"
import { shelves } from "@/lib/content/books"
import { formatDate, formatReadingTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { ContentBody } from "@/components/content/body"
import { EssayRow, ProjectCard } from "@/components/content/cards"
import { EmptyState } from "@/components/studio/characters"
import { CoverMat } from "@/components/studio/cover-mat"
import { Settle } from "@/components/studio/motion"
import { PageHero } from "@/components/studio/page-hero"
import { PillAnchor } from "@/components/studio/pill"
import { SectionHeading } from "@/components/studio/section-heading"
import { bandShapes } from "@/components/studio/shape-presets"
import { Shelf } from "@/components/studio/shelf"
import { MetaPill, Sticker } from "@/components/studio/sticker"
import { headlineFor } from "./headlines"

type Collection = Extract<Document, { kind: "collection" }>

export function CollectionView({ document }: { document: Collection }) {
  switch (document.section) {
    case "projects":
      return <WorkIndex document={document} />
    case "blog":
      return <WritingIndex document={document} />
    case "books":
      return <BooksIndex document={document} />
  }
}

/* ── Work ───────────────────────────────────────────────────────────── */

const tierCopy = {
  flagship: {
    title: "Selected work",
    aside: "The ones I’d point to first.",
  },
  side: {
    title: "Side projects",
    aside: "Built to understand something, then kept.",
  },
  early: {
    title: "Earlier work",
    aside: "University years. Rough edges included.",
  },
} as const

function WorkIndex({ document }: { document: Collection }) {
  const flagship = projects.filter((project) => project.tier === "flagship")
  const [lead, ...rest] = flagship
  const left = rest.filter((_, index) => index % 2 === 0)
  const right = rest.filter((_, index) => index % 2 === 1)
  return (
    <div className="flex flex-col gap-20 pb-8 sm:gap-28">
      <PageHero
        hue="lilac"
        title={document.title}
        headline={headlineFor(document.path, document.title)}
        lede={document.description}
        shapes={bandShapes("lilac", 0)}
      />
      <div className="frame flex flex-col gap-20 sm:gap-28">
        <div className="max-w-read">
          <ContentBody code={document.mdx} />
        </div>
        <section
          className="flex flex-col gap-12"
          aria-labelledby="tier-flagship"
        >
          <SectionHeading id="tier-flagship" {...tierCopy.flagship} />
          {lead && (
            <Settle>
              <ProjectCard project={lead} index={0} lead />
            </Settle>
          )}
          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            {[left, right].map((column, columnIndex) => (
              <ul
                key={columnIndex}
                className={cn(
                  "flex flex-col gap-10 md:gap-14",
                  columnIndex === 1 && "md:pt-20"
                )}
              >
                {column.map((project, index) => {
                  const position = index * 2 + columnIndex + 1
                  return (
                    <Settle as="li" key={project.path} index={position}>
                      <ProjectCard project={project} index={position} />
                    </Settle>
                  )
                })}
              </ul>
            ))}
          </div>
        </section>
        {(["side", "early"] as const).map((tier, tierIndex) => (
          <section
            key={tier}
            className="flex flex-col gap-10"
            aria-labelledby={`tier-${tier}`}
          >
            <SectionHeading id={`tier-${tier}`} {...tierCopy[tier]} />
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {projects
                .filter((project) => project.tier === tier)
                .map((project, index) => (
                  <Settle as="li" key={project.path} index={index}>
                    <ProjectCard
                      project={project}
                      index={index + 2 + tierIndex * 3}
                    />
                  </Settle>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

/* ── Writing ────────────────────────────────────────────────────────── */

const topicsOf = (entry: Document) =>
  entry.categories.length > 0 ? entry.categories : entry.tags.slice(0, 1)

function WritingIndex({ document }: { document: Collection }) {
  const [topic, setTopic] = useState<string | null>(null)
  const topics = [...new Set(articles.flatMap(topicsOf))].sort((a, b) =>
    a.localeCompare(b)
  )
  const [featured, ...others] = articles
  const visible = topic
    ? articles.filter((entry) => topicsOf(entry).includes(topic))
    : others
  return (
    <div className="flex flex-col gap-20 pb-8 sm:gap-24">
      <PageHero
        hue="peach"
        title={document.title}
        headline={headlineFor(document.path, document.title)}
        lede={document.description}
        shapes={bandShapes("peach", 1)}
      >
        <PillAnchor href="/blog/index.xml" variant="paper" size="sm">
          <Rss aria-hidden="true" />
          RSS
        </PillAnchor>
      </PageHero>

      <div data-hue="peach" className="frame flex flex-col gap-20 sm:gap-24">
        <div className="max-w-read">
          <ContentBody code={document.mdx} />
        </div>

        {featured && (
          <Settle>
            <FeaturedEssay entry={featured} />
          </Settle>
        )}

        {document.startHere.length > 0 && (
          <section
            className="flex flex-col gap-10"
            aria-labelledby="start-here"
          >
            <SectionHeading
              id="start-here"
              title="If you only read a few"
              aside="Four to start with, in the order I’d hand them to you."
            />
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {document.startHere.map((reference, index) => {
                const entry = requireDocument(reference.page)
                return (
                  <Settle
                    as="li"
                    key={reference.page}
                    index={index}
                    tilt={[-1.5, 1, -0.75, 1.75][index] ?? 0}
                  >
                    <Link
                      to={reference.page}
                      data-hue={
                        (["butter", "mint", "sky", "lilac"] as const)[index % 4]
                      }
                      className="group flex h-full flex-col gap-4 rounded-lg bg-hue-tint p-6 transition-transform duration-500 ease-(--ease-settle) hover:-translate-y-1 hover:rotate-0"
                    >
                      <span className="type-numeral text-[3.5rem] text-hue-deep">
                        {index + 1}
                      </span>
                      <span className="type-serif-title text-xl text-ink">
                        {entry.title}
                      </span>
                      <span className="text-[0.95rem] leading-relaxed text-ink-soft">
                        {reference.note}
                      </span>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-ink">
                        Read it
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 transition-transform duration-300 ease-(--ease-pop) group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  </Settle>
                )
              })}
            </ol>
          </section>
        )}

        <section className="flex flex-col gap-8" aria-labelledby="all-writing">
          <SectionHeading
            id="all-writing"
            title="All writing"
            aside={`${articles.length} essays, newest first.`}
          />
          <div
            role="group"
            aria-label="Filter by topic"
            className="-mx-4 no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1"
          >
            <TopicPill active={topic === null} onClick={() => setTopic(null)}>
              Everything
            </TopicPill>
            {topics.map((name) => (
              <TopicPill
                key={name}
                active={topic === name}
                onClick={() => setTopic(name)}
              >
                {name}
              </TopicPill>
            ))}
          </div>
          {visible.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {visible.map((entry, index) => (
                <Settle as="li" key={entry.path} index={index < 6 ? index : 0}>
                  <EssayRow entry={entry} />
                </Settle>
              ))}
            </ul>
          ) : (
            <EmptyState shape="scallop" hue="peach">
              No essays under this topic yet. Soon.
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  )
}

function TopicPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "pressable h-10 shrink-0 cursor-pointer rounded-full px-4 text-sm font-semibold whitespace-nowrap",
        active
          ? "bg-ink text-paper"
          : "bg-paper-raised text-ink-soft shadow-soft hover:text-ink"
      )}
    >
      {children}
    </button>
  )
}

function FeaturedEssay({ entry }: { entry: Document }) {
  return (
    <Link
      to={entry.path}
      className="group relative grid items-center gap-8 overflow-hidden rounded-2xl bg-hue-tint p-6 sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12"
    >
      <div className="flex flex-col items-start gap-5">
        <Sticker icon={BookOpen} hue="butter" rotate={-4}>
          Newest
        </Sticker>
        <h2 className="type-h2 text-ink">{entry.title}</h2>
        <p className="type-lede text-[1.15rem] text-ink-soft">
          {entry.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {entry.publishedAt && (
            <MetaPill>{formatDate(entry.publishedAt)}</MetaPill>
          )}
          <MetaPill>{formatReadingTime(entry.readingMinutes)} read</MetaPill>
          <span className="grid size-10 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 ease-(--ease-pop) group-hover:rotate-45">
            <ArrowUpRight
              aria-hidden="true"
              className="size-4"
              strokeWidth={2.4}
            />
          </span>
        </div>
      </div>
      <CoverMat
        asset={entry.cover?.ascii}
        alt={entry.cover?.alt ?? entry.title}
        seed={entry.path}
        hue="peach"
        className="rotate-[1.5deg] transition-transform duration-500 ease-(--ease-settle) group-hover:rotate-0"
      />
    </Link>
  )
}

/* ── Books ──────────────────────────────────────────────────────────── */

function BooksIndex({ document }: { document: Collection }) {
  return (
    <div className="flex flex-col gap-20 pb-8 sm:gap-24">
      <PageHero
        hue="sky"
        title={document.title}
        headline={headlineFor(document.path, document.title)}
        lede={document.description}
        shapes={bandShapes("sky", 2)}
      />
      <div data-hue="sky" className="frame flex flex-col gap-20">
        {document.mdx && document.content.trim() && (
          <div className="max-w-read">
            <ContentBody code={document.mdx} />
          </div>
        )}
        {shelves.map(({ shelf, books }, index) => (
          <section
            key={shelf.path}
            aria-labelledby={`shelf-${index}`}
            className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-14"
          >
            <div className="flex flex-col items-start gap-3">
              <p className="type-label text-hue-deep">
                Shelf {index + 1} · {books.length} books
              </p>
              <h2 id={`shelf-${index}`} className="type-h2 text-ink">
                <Link to={shelf.path} className="hover:text-ink-soft">
                  {shelf.title}
                </Link>
              </h2>
              <p className="text-ink-soft">{shelf.description}</p>
              <Link
                to={shelf.path}
                className="group inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-ink"
              >
                Read the notes
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 ease-(--ease-pop) group-hover:translate-x-1"
                />
              </Link>
            </div>
            <Shelf books={books} />
          </section>
        ))}
      </div>
    </div>
  )
}
