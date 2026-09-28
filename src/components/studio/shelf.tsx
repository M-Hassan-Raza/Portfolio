import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"
import { NotePopover } from "@/components/system/overlays"
import { firstSentence } from "@/lib/content/books"
import type { Book } from "@/lib/content/books"
import { hashOf } from "@/lib/studio"
import { cn } from "@/lib/utils"

/** Spines wear tones of the shelf's own block, never a rainbow. */
const spineTones = [
  "bg-block text-on-block",
  "bg-ink text-paper",
  "bg-paper-raised text-ink",
  "bg-block text-on-block",
  "bg-block-tint text-ink",
] as const

/** A spine. Height, width and tone come from the title, so they never shuffle. */
export function Spine({ book, index }: { book: Book; index: number }) {
  const hash = hashOf(book.title)
  const height = 196 + (hash % 76)
  const width = Math.min(62, Math.max(38, 28 + book.title.length * 0.6))
  const lean = index % 6 === 4 ? -5 : 0
  const tone = spineTones[hash % spineTones.length] ?? spineTones[0]
  return (
    <NotePopover
      trigger={
        <button
          type="button"
          aria-label={`${book.title} by ${book.author}`}
          className={cn(
            "spine relative flex shrink-0 cursor-pointer snap-start flex-col items-center justify-between rounded-[5px] border-2 border-ink px-1 py-3",
            tone
          )}
          style={
            {
              height: `${height}px`,
              width: `${width}px`,
              "--lean": `${lean}deg`,
            } as CSSProperties
          }
        >
          <span aria-hidden="true" className="h-0.5 w-3/5 bg-current" />
          <span className="spine-title line-clamp-1 max-h-[80%] overflow-hidden text-[0.8125rem] leading-none font-bold tracking-[-0.01em] text-ellipsis whitespace-nowrap">
            {book.title}
          </span>
          <span aria-hidden="true" className="h-0.5 w-3/5 bg-current" />
        </button>
      }
    >
      <div className="flex flex-col gap-1">
        <p className="type-label text-ink-soft">{book.shelf.title}</p>
        <p className="type-h3">{book.title}</p>
        <p className="text-sm text-ink-soft">{book.author}</p>
      </div>
      <p className="font-serif text-[0.975rem] leading-snug text-ink">
        {firstSentence(book.review)}
      </p>
      <Link
        to={book.shelf.path}
        className="group inline-flex items-center gap-1.5 text-sm font-bold text-ink underline decoration-2 underline-offset-4"
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

/** Spines standing on a shelf. Scrolls sideways on phones. */
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
    <div className={cn("flex w-fit max-w-full min-w-0 flex-col", className)}>
      <div className="no-scrollbar flex snap-x snap-mandatory items-end gap-1.5 overflow-x-auto overflow-y-visible px-3 pt-8 sm:pr-16 sm:pl-5">
        {books.map((book, index) => (
          <Spine key={book.id} book={book} index={index} />
        ))}
        {aside}
      </div>
      <div aria-hidden="true" className="h-2.5 rounded-full bg-ink" />
      {label && (
        <div className="flex items-center gap-2 px-2 pt-3">{label}</div>
      )}
    </div>
  )
}
