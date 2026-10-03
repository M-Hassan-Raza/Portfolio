import { ArrowRight } from "lucide-react"
import type { Document } from "@/lib/content/types"
import { shelves } from "@/lib/content/books"
import { ContentBody } from "@/components/content/body"
import { Comments } from "@/components/content/comments"
import { BlockHero } from "@/components/studio/block-hero"
import { SectionHeading } from "@/components/studio/section-heading"
import { Shelf } from "@/components/studio/shelf"
import { TiltCardLink } from "@/components/studio/tilt-card"

/** A book shelf page: the spines up top, the reviews below, other shelves last. */
export function ShelfPage({ document }: { document: Document }) {
  const shelf = shelves.find((entry) => entry.shelf.path === document.path)
  const others = shelves.filter((entry) => entry.shelf.path !== document.path)
  return (
    <div data-block="lemon" className="flex flex-col gap-16 pb-24 sm:gap-20">
      <BlockHero
        block="lemon"
        kicker={shelf ? `${shelf.books.length} books` : "Books"}
        title={document.title}
        size="l"
        lede={document.description}
      />
      {shelf && (
        <div className="frame">
          <Shelf books={shelf.books} />
        </div>
      )}
      <div className="frame flex flex-col gap-16">
        <ContentBody path={document.path} />
        {document.comments && (
          <div className="mx-auto w-full max-w-read">
            <Comments path={document.path} />
          </div>
        )}
        <nav aria-label="Other shelves" className="flex flex-col gap-8">
          <SectionHeading title="Other shelves" />
          <ul className="grid gap-6 sm:grid-cols-3">
            {others.map(({ shelf: other, books }, index) => (
              <li key={other.path}>
                <TiltCardLink
                  to={other.path}
                  tiltIndex={index}
                  className="flex h-full flex-col gap-2 bg-paper-raised p-6 text-ink"
                >
                  <span className="type-label text-ink-soft">
                    {books.length} books
                  </span>
                  <span className="flex items-center justify-between gap-2 type-h3">
                    {other.title}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-5 transition-transform duration-300 ease-(--ease-pop) group-hover:translate-x-1"
                    />
                  </span>
                </TiltCardLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
