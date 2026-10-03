import { Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight, Mail, Rss } from "lucide-react"
import { Suspense } from "react"
import type { ReactNode } from "react"
import type { Document } from "@/lib/content/types"
import { profile } from "#content"
import { articles, getDocument } from "@/lib/content/catalog"
import { taxonomyPath } from "@/lib/content/taxonomies"
import { formatDate, formatReadingTime } from "@/lib/format"
import { blockFor } from "@/lib/studio"
import type { Surface } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { ContentBody } from "@/components/content/body"
import { Comments } from "@/components/content/comments"
import { TableOfContents } from "@/components/content/toc"
import { CoverFrame } from "@/components/studio/cover-card"
import { PillAnchor } from "@/components/studio/pill"
import { MetaPill } from "@/components/studio/tag"

type Article = Extract<Document, { kind: "article" }>

/** A back link to the parent collection: a small paper pill. */
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
      className="pressable group inline-flex h-10 items-center gap-2 self-start rounded-full border-2 border-ink bg-paper-raised pr-4 pl-1.5 text-sm font-semibold text-ink"
    >
      <span className="grid size-7 place-items-center rounded-full bg-ink text-paper transition-transform duration-300 ease-(--ease-pop) group-hover:-translate-x-0.5">
        <ArrowLeft aria-hidden="true" className="size-3.5" strokeWidth={2.6} />
      </span>
      {children}
    </Link>
  )
}

/** Tags as outlined pills that lead to their topic pages. */
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
            className="pressable-flat inline-flex h-9 items-center rounded-full border-2 border-ink px-4 text-sm font-semibold text-ink hover:bg-block hover:text-on-block"
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
  const showToc = document.toc && document.hasToc
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
          <Suspense fallback={null}>
            <TableOfContents path={document.path} className="sticky top-28" />
          </Suspense>
        </aside>
      )}
      <div
        className={cn(
          "flex min-w-0 flex-col gap-14",
          !showToc && "mx-auto w-full max-w-read"
        )}
      >
        {children}
        {document.hasBody && <ContentBody path={document.path} />}
        {after}
      </div>
    </div>
  )
}

/**
 * The next piece, as a full block in its own colour: one big title and an
 * arrow. The obvious next click at the end of a page.
 */
export function NextBlock({ kind, next }: { kind: string; next: Document }) {
  return (
    <Link
      to={next.path}
      data-block={blockFor(next.path)}
      className="surface-block group block"
    >
      <span className="frame flex flex-col gap-6 py-16 sm:py-24">
        <span className="flex items-center justify-between gap-4 type-label">
          <span>{kind}</span>
          <span className="grid size-12 place-items-center rounded-full border-2 border-ink-fixed bg-paper-fixed-raised text-ink-fixed shadow-small transition-transform duration-300 ease-(--ease-pop) group-hover:translate-x-1.5">
            <ArrowRight
              aria-hidden="true"
              className="size-5"
              strokeWidth={2.6}
            />
          </span>
        </span>
        <span className="max-w-[18ch] type-display-xl text-block-deep">
          {next.title}
        </span>
        <span className="max-w-2xl type-lede">{next.description}</span>
      </span>
    </Link>
  )
}

/** A piece's header: its own colour block, straight edges, cover breaking out. */
export function PieceHeader({
  block,
  back,
  meta,
  title,
  lede,
  cover,
  children,
}: {
  block: Surface
  back: ReactNode
  meta: ReactNode
  title: ReactNode
  lede: ReactNode
  cover?: ReactNode
  children?: ReactNode
}) {
  return (
    <header data-block={block} className="surface-block">
      <div
        className={cn(
          "frame grid gap-10 pt-28 sm:pt-36",
          cover
            ? "pb-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:pb-0"
            : "pb-16 sm:pb-20"
        )}
      >
        <div className={cn("flex min-w-0 flex-col gap-6", cover && "lg:pb-16")}>
          {back}
          <div className="flex flex-wrap items-center gap-2">{meta}</div>
          <h1 className="type-title">{title}</h1>
          <p className="max-w-2xl type-lede">{lede}</p>
          {children}
        </div>
        {cover && <div className="lg:-mb-20 lg:translate-y-0">{cover}</div>}
      </div>
    </header>
  )
}

export function ArticleView({ document }: { document: Article }) {
  const index = articles.findIndex((entry) => entry.path === document.path)
  const next = articles[index + 1] ?? articles[0]
  const topic = document.categories[0] ?? document.tags[0]
  const parent = getDocument("/blog/")
  const block = blockFor(document.path)
  const cover = document.cover && !document.cover.hidden ? document.cover : null
  return (
    <article className="flex flex-col gap-16 sm:gap-28">
      <PieceHeader
        block={block}
        back={<BackLink to="/blog/">{parent?.title ?? "Writing"}</BackLink>}
        meta={
          <>
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
            {topic && <MetaPill>{topic}</MetaPill>}
          </>
        }
        title={document.title}
        lede={document.description}
        cover={
          cover && (
            <div className="rotate-2 rounded-xl border-2 border-ink bg-paper-raised p-2 shadow-rest">
              <CoverFrame asset={cover.ascii} alt={cover.alt} />
            </div>
          )
        }
      />

      <div data-block={block}>
        <ReadingLayout
          document={document}
          after={
            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-5 border-t-2 border-ink pt-6">
                <p className="type-h3">End. Thanks for reading.</p>
                <TagRow tags={document.tags} />
                <div className="flex flex-wrap gap-3 pt-2">
                  <PillAnchor
                    href={`mailto:${profile.email}`}
                    variant="paper"
                    size="sm"
                  >
                    <Mail aria-hidden="true" />
                    Reply by email
                  </PillAnchor>
                  <PillAnchor href="/blog/index.xml" variant="ghost" size="sm">
                    <Rss aria-hidden="true" />
                    Follow by RSS
                  </PillAnchor>
                </div>
              </div>
              {document.comments && <Comments path={document.path} />}
            </div>
          }
        />
      </div>

      {next && next !== document && <NextBlock kind="Next essay" next={next} />}
    </article>
  )
}
