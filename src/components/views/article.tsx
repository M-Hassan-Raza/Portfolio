import { Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight, Mail, Rss } from "lucide-react"
import type { ReactNode } from "react"
import type { Document } from "#content"
import { profile } from "#content"
import { articles, getDocument } from "@/lib/content/catalog"
import { taxonomyPath } from "@/lib/content/taxonomies"
import { formatDate, formatReadingTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { ContentBody } from "@/components/content/body"
import { Comments } from "@/components/content/comments"
import { EssayRow } from "@/components/content/cards"
import { TableOfContents } from "@/components/content/toc"
import { CoverMat } from "@/components/studio/cover-mat"
import { Band } from "@/components/studio/page-hero"
import { PillAnchor } from "@/components/studio/pill"
import { Scribble } from "@/components/studio/scribble"
import { MetaPill } from "@/components/studio/sticker"

type Article = Extract<Document, { kind: "article" }>

/** A back link to the parent collection. */
export function BackLink({
  to,
  children,
}: {
  to: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 self-start rounded-full bg-paper-raised py-1.5 pr-4 pl-1.5 text-sm font-semibold text-ink shadow-soft"
    >
      <span className="grid size-7 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 ease-(--ease-pop) group-hover:-translate-x-0.5">
        <ArrowLeft aria-hidden="true" className="size-3.5" strokeWidth={2.6} />
      </span>
      {children}
    </Link>
  )
}

/** Tags as small paper pills that lead to their topic pages. */
export function TagRow({
  tags,
  className,
}: {
  tags: readonly string[]
  className?: string
}) {
  if (tags.length === 0) return null
  return (
    <ul aria-label="Tags" className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            to={taxonomyPath("tags", tag)}
            className="pressable inline-flex h-9 items-center rounded-full bg-paper-sunk px-4 text-sm font-medium text-ink-soft hover:bg-hue-tint hover:text-ink"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Reading layout: an optional sticky ToC rail and a 680px Fraunces column. */
export function ReadingLayout({
  document,
  children,
  after,
}: {
  document: Document
  children?: ReactNode
  after?: ReactNode
}) {
  const showToc =
    document.toc && document.headings.some((heading) => heading.depth === 2)
  return (
    <div
      className={cn(
        "frame grid gap-12",
        showToc &&
          "lg:grid-cols-[14rem_minmax(0,var(--container-read))] lg:justify-center lg:gap-16"
      )}
    >
      {showToc && (
        <aside className="hidden lg:block">
          <TableOfContents
            headings={document.headings}
            className="sticky top-28"
          />
        </aside>
      )}
      <div
        className={cn(
          "flex min-w-0 flex-col gap-14",
          !showToc && "mx-auto w-full max-w-read"
        )}
      >
        {children}
        <ContentBody code={document.mdx} />
        {after}
      </div>
    </div>
  )
}

export function ArticleView({ document }: { document: Article }) {
  const index = articles.findIndex((entry) => entry.path === document.path)
  const next = articles[index + 1] ?? articles[0]
  const topic = document.categories[0] ?? document.tags[0]
  const parent = getDocument("/blog/")
  return (
    <article data-hue="peach" className="flex flex-col gap-16 pb-8 sm:gap-20">
      <Band hue="peach">
        <div
          className={cn(
            "grid items-center gap-10",
            document.cover &&
              !document.cover.hidden &&
              "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14"
          )}
        >
          <header className="flex flex-col gap-5">
            <BackLink to="/blog/">{parent?.title ?? "Writing"}</BackLink>
            <h1 className="type-title text-ink">{document.title}</h1>
            <p className="max-w-2xl type-lede text-ink-soft">
              {document.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="flex items-center gap-2 pr-2 text-sm font-semibold text-ink">
                <img
                  src="/assets/portrait-480.jpg"
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 rounded-full border-2 border-paper-raised object-cover object-[50%_18%]"
                />
                {profile.name}
              </span>
              {document.publishedAt && (
                <MetaPill>
                  <time dateTime={document.publishedAt}>
                    {formatDate(document.publishedAt)}
                  </time>
                </MetaPill>
              )}
              <MetaPill>
                {formatReadingTime(document.readingMinutes)} read
              </MetaPill>
              {topic && <MetaPill tone="hue">{topic}</MetaPill>}
            </div>
          </header>
          {document.cover && !document.cover.hidden && (
            <CoverMat
              asset={document.cover.ascii}
              alt={document.cover.alt}
              seed={document.path}
              hue="peach"
              className="rotate-[2deg]"
            />
          )}
        </div>
      </Band>

      <ReadingLayout
        document={document}
        after={
          <div className="flex flex-col gap-14">
            <TagRow tags={document.tags} />
            <ThanksCard next={next !== document ? next : undefined} />
            {document.comments && <Comments path={document.path} />}
          </div>
        }
      />
    </article>
  )
}

function ThanksCard({ next }: { next?: Document }) {
  return (
    <section
      aria-labelledby="thanks"
      data-hue="butter"
      className="flex flex-col gap-6 rounded-2xl bg-hue-tint p-6 sm:p-9"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="thanks" className="type-h2 text-ink">
            Thanks for reading
          </h2>
          <p className="type-annotation text-lg text-ink-soft">
            If it was useful, the next one might be too.
          </p>
        </div>
        <Scribble
          variant="heart"
          className="size-14 shrink-0 rotate-6"
          delay={300}
          strokeWidth={3}
        />
      </div>
      {next && <EssayRow entry={next} />}
      <div className="flex flex-wrap gap-3">
        <PillAnchor href={`mailto:${profile.email}`} variant="paper" size="sm">
          <Mail aria-hidden="true" />
          Reply by email
        </PillAnchor>
        <PillAnchor href="/blog/index.xml" variant="ghost" size="sm">
          <Rss aria-hidden="true" />
          Follow by RSS
        </PillAnchor>
      </div>
    </section>
  )
}

export function NextLink({
  to,
  label,
  title,
}: {
  to: string
  label: string
  title: string
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-1 rounded-lg bg-paper-raised p-5 hover:shadow-soft"
    >
      <span className="type-label text-ink-faint">{label}</span>
      <span className="flex items-center gap-2 type-serif-title text-lg text-ink">
        {title}
        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform duration-300 ease-(--ease-pop) group-hover:translate-x-1"
        />
      </span>
    </Link>
  )
}
