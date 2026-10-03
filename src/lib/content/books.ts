import { books } from "./catalog"
import type { ShelfEntry } from "./shelf"
import type { Document } from "./types"

/** One book on a shelf page, with the shelf it sits on. */
export type Book = ShelfEntry & { shelf: Document; id: string }

/** Shelves in the order they sit on the wall. */
const shelfOrder = ["technical", "non-fiction", "fiction", "pakistan"]

export const shelves = books
  .filter((document) => document.path !== "/books/")
  .sort(
    (a, b) =>
      shelfOrder.findIndex((key) => a.path.includes(key)) -
      shelfOrder.findIndex((key) => b.path.includes(key))
  )
  .map((shelf) => ({
    shelf,
    books: shelf.books.map((entry): Book => ({
      ...entry,
      shelf,
      id: `${shelf.path}#${entry.cover}`,
    })),
  }))

export const allBooks = shelves.flatMap((entry) => entry.books)

/** The first sentence of a review, for a spine's note. */
export function firstSentence(text: string) {
  const match = /^[\s\S]*?[.!?](?=\s|$)/.exec(text)
  return match ? match[0] : text
}
