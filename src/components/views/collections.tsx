import { Link } from "@tanstack/react-router"
import { ArrowRight, ArrowUpRight, Rss } from "lucide-react"
import { useState } from "react"
import type { Document } from "#content"
import { articles, projects, requireDocument } from "@/lib/content/catalog"
import { shelves } from "@/lib/content/books"
import { formatDate, formatReadingTime, yearOf } from "@/lib/format"
import { blockFor } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { ContentBody } from "@/components/content/body"
import { EssayCard, ProjectCard, entryRow } from "@/components/content/cards"
import { BlockHero } from "@/components/studio/block-hero"
import { CoverFrame } from "@/components/studio/cover-card"
import { EmptyBlock } from "@/components/studio/empty-block"
import { IndexList } from "@/components/studio/index-list"
import type { IndexRow } from "@/components/studio/index-list"
import { Settle } from "@/components/studio/motion"
import { PillAnchor } from "@/components/studio/pill"
import { SectionHeading } from "@/components/studio/section-heading"
import { Shelf } from "@/components/studio/shelf"
import { MetaPill } from "@/components/studio/tag"
import { TiltCardLink } from "@/components/studio/tilt-card"

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

function Intro({ document }: { document: Document }) {
  if (!document.content.trim()) return null
  return (
    <div className="frame">
      <div className="max-w-read">
        <ContentBody code={document.mdx} />
      </div>
    </div>
  )
}

/* ── Work ───────────────────────────────────────────────────────────── */

const tierCopy = {
  side: {
    title: "Side projects",
    aside: "Built to understand something, then kept.",
  },
  early: {
    title: "Earlier work",
    aside: "University years. Rough edges included.",
  },
} as const

function projectRow(project: Extract<Document, { kind: "project" }>): IndexRow {
  return {
    key: project.path,
    href: project.path,
    title: project.title,
    label: project.title,
    block: blockFor(project.path),
    year: project.publishedAt ? yearOf(project.publishedAt) : undefined,
    meta: project.projectLabel,
    note: project.description,
    cover:
      project.cover && !project.cover.hidden ? project.cover.ascii : undefined,
  }
}

function WorkIndex({ document }: { document: Collection }) {
  const flagship = projects.filter((project) => project.tier === "flagship")
  const [lead, ...rest] = flagship
  return (
    <div className="flex flex-col gap-20 pb-24 sm:gap-28">
      <BlockHero
        block="tomato"
        kicker={`${projects.length} projects, newest first`}
        title={document.title}
        lede={document.description}
      />
      <Intro document={document} />
      <section
        aria-labelledby="tier-flagship"
        className="frame flex flex-col gap-12"
      >
        <SectionHeading
          id="tier-flagship"
          title="Selected work"
          aside="The ones I’d point to first."
        />
        {lead && (
          <Settle>
            <ProjectCard project={lead} index={0} lead />
          </Settle>
        )}
        <ul className="grid gap-10 md:grid-cols-2 md:gap-x-12 md:gap-y-14">
          {rest.map((project, index) => (
            <Settle
              as="li"
              key={project.path}
              index={index}
              className={cn(index % 2 === 1 && "md:translate-y-16")}
            >
              <ProjectCard project={project} index={index + 1} />
            </Settle>
          ))}
        </ul>
      </section>
      {(["side", "early"] as const).map((tier) => (
        <section
          key={tier}
          className="frame flex flex-col gap-8 pt-8"
          aria-labelledby={`tier-${tier}`}
        >
          <SectionHeading id={`tier-${tier}`} {...tierCopy[tier]} />
          <IndexList
            rows={projects
              .filter((project) => project.tier === tier)
              .map(projectRow)}
          />
        </section>
      ))}
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
    <div className="flex flex-col gap-20 pb-24 sm:gap-28">
      <BlockHero
        block="ultramarine"
        kicker={`${articles.length} essays, newest first`}
        title={document.title}
        lede={document.description}
      >
        <PillAnchor href="/blog/index.xml" variant="paper" size="md">
          <Rss aria-hidden="true" />
          Follow by RSS
        </PillAnchor>
      </BlockHero>
      <Intro document={document} />

      {featured && (
        <section aria-label="Newest essay" className="frame">
          <Settle>
            <FeaturedEssay entry={featured} />
          </Settle>
        </section>
      )}

      {document.startHere.length > 0 && (
        <section
          className="frame flex flex-col gap-10"
          aria-labelledby="start-here"
        >
          <SectionHeading
            id="start-here"
            title="If you only read a few"
            aside="Four to start with, in the order I’d hand them to you."
          />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {document.startHere.map((reference, index) => (
              <Settle as="li" key={reference.page} index={index}>
                <EssayCard
                  entry={requireDocument(reference.page)}
                  note={reference.note}
                  index={index}
                  number={index + 1}
                />
              </Settle>
            ))}
          </ol>
        </section>
      )}

      <section
        className="frame flex flex-col gap-8"
        aria-labelledby="all-writing"
      >
        <SectionHeading
          id="all-writing"
          title="All writing"
          aside="Filter by topic, or just scroll."
        />
        <div
          role="group"
          aria-label="Filter by topic"
          className="-mx-4 no-scrollbar flex gap-2 overflow-x-auto px-4 pt-1 pb-2"
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
          <IndexList rows={visible.map((entry) => entryRow(entry))} />
        ) : (
          <EmptyBlock block="ultramarine" title="Nothing here. Yet.">
            No essays under this topic so far.
          </EmptyBlock>
        )}
      </section>
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
        "pressable-flat h-10 shrink-0 cursor-pointer rounded-full border-2 border-ink px-4 text-sm font-semibold whitespace-nowrap",
        active
          ? "bg-ink text-paper"
          : "bg-paper-raised text-ink hover:bg-paper-sunk"
      )}
    >
      {children}
    </button>
  )
}

function FeaturedEssay({ entry }: { entry: Document }) {
  return (
    <TiltCardLink
      to={entry.path}
      tilt={-0.75}
      block={blockFor(entry.path)}
      className="grid items-stretch gap-2 bg-paper-raised p-2.5 text-ink lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
    >
      <div className="flex flex-col items-start justify-end gap-5 p-5 sm:p-8">
        <MetaPill tone="ink">Newest</MetaPill>
        <h2 className="type-title">{entry.title}</h2>
        <p className="font-serif text-[1.2rem] leading-snug text-ink-soft">
          {entry.description}
        </p>
        <div className="flex w-full flex-wrap items-center gap-2 pt-2">
          {entry.publishedAt && (
            <MetaPill>{formatDate(entry.publishedAt)}</MetaPill>
          )}
          <MetaPill>{formatReadingTime(entry.readingMinutes)} read</MetaPill>
          <span className="ml-auto grid size-11 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 ease-(--ease-pop) group-hover:rotate-45">
            <ArrowUpRight
              aria-hidden="true"
              className="size-5"
              strokeWidth={2.6}
            />
          </span>
        </div>
      </div>
      <CoverFrame
        asset={entry.cover?.ascii}
        alt={entry.cover?.alt ?? entry.title}
        aspect="aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-80"
      />
    </TiltCardLink>
  )
}

/* ── Books ──────────────────────────────────────────────────────────── */

function BooksIndex({ document }: { document: Collection }) {
  const total = shelves.reduce((sum, { books }) => sum + books.length, 0)
  return (
    <div className="flex flex-col gap-16 pb-24 sm:gap-24">
      <BlockHero
        block="lemon"
        kicker={`${shelves.length} shelves, ${total} books`}
        title={document.title}
        lede={document.description}
      />
      <Intro document={document} />
      <div data-block="lemon" className="frame flex flex-col gap-20 sm:gap-24">
        {shelves.map(({ shelf, books }, index) => (
          <section
            key={shelf.path}
            aria-labelledby={`shelf-${index}`}
            className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-14"
          >
            <div className="flex flex-col items-start gap-3">
              <p className="type-label text-ink-soft">
                Shelf {index + 1} · {books.length} books
              </p>
              <h2 id={`shelf-${index}`} className="type-h2">
                <Link to={shelf.path} className="hover:underline">
                  {shelf.title}
                </Link>
              </h2>
              <p className="font-serif text-[1.05rem] text-ink-soft">
                {shelf.description}
              </p>
              <Link
                to={shelf.path}
                className="group inline-flex items-center gap-1.5 pt-1 text-[0.95rem] font-bold text-ink underline decoration-2 underline-offset-4"
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
