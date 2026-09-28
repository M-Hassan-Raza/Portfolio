import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"
import { NotePopover } from "@/components/system/overlays"
import { firstSentence } from "@/lib/content/books"
import type { Book } from "@/lib/content/books"
import { hashOf, hueFromText } from "@/lib/studio"
import { cn } from "@/lib/utils"

/** Rounded pastel spine. Size and colour come from the title, so they never shuffle. */
export function Spine({ book, index }: { book: Book; index: number }) {
  const hash = hashOf(book.title)
  const height = 200 + (hash % 71)
  const width = Math.min(60, Math.max(36, 26 + book.title.length * 0.6))
  const lean = index % 5 === 3 ? -6 : 0
  const hue = hueFromText(book.title)
  return (
    <NotePopover
      trigger={
        <button
          type="button"
          data-hue={hue}
          aria-label={`${book.title} by ${book.author}`}
          className="spine relative flex shrink-0 cursor-pointer snap-start flex-col items-center justify-between rounded-[6px] bg-hue px-1 py-3 text-on-pastel"
          style={
            {
              height: `${height}px`,
              width: `${width}px`,
              "--lean": `${lean}deg`,
            } as CSSProperties
          }
        >
          <span
            aria-hidden="true"
            className="h-1 w-3/5 rounded-full bg-paper-raised"
          />
          <span className="spine-title line-clamp-1 max-h-[80%] overflow-hidden text-[0.8125rem] leading-none font-semibold tracking-[-0.01em] text-ellipsis whitespace-nowrap">
            {book.title}
          </span>
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-paper-raised"
          />
        </button>
      }
    >
      <div className="flex flex-col gap-1">
        <p className="type-label text-ink-faint">{book.shelf.title}</p>
        <p className="type-serif-title text-lg">{book.title}</p>
        <p className="text-sm text-ink-soft">{book.author}</p>
      </div>
      <p className="type-annotation text-[0.975rem] leading-snug text-ink">
        {firstSentence(book.review)}
      </p>
      <Link
        to={book.shelf.path}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink"
      >
        The full note
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-300 ease-(--ease-pop) group-hover:translate-x-1"
        />
      </Link>
    </NotePopover>
  )
}

/** Spines standing on a hand-drawn shelf line. Scrolls sideways on phones. */
export function Shelf({
  books,
  label,
  className,
  aside,
}: {
  books: readonly Book[]
  label?: ReactNode
  className?: string
  aside?: ReactNode
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="no-scrollbar flex snap-x snap-mandatory items-end gap-2 overflow-x-auto overflow-y-visible px-4 pt-6 sm:px-6">
        {books.map((book, index) => (
          <Spine key={book.id} book={book} index={index} />
        ))}
        {aside}
      </div>
      <div className="relative flex items-center gap-3" data-hue="peach">
        <svg
          viewBox="0 0 600 14"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="block h-3.5 w-full text-hue"
        >
          <path
            d="M3 8 C80 5 160 9 240 7 C330 5 420 10 500 7 C540 6 570 7 597 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {label && (
        <div className="flex items-center gap-2 px-2 pt-3">{label}</div>
      )}
    </div>
  )
}
