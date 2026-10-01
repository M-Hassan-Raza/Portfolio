import type { Document } from "#content"
import { books } from "./catalog"

/** One book as authored in a shelf page: title, author, cover and review. */
export type Book = {
  title: string
  author: string
  cover: string
  review: string
  shelf: Document
  id: string
}

const entryPattern =
  /###\s*<span className="book-subtitle">([\s\S]*?)<\/span>[\s\S]*?asset="([a-z0-9-]+)"[\s\S]*?<p className="author">Author:\s*([\s\S]*?)<\/p>[\s\S]*?<blockquote className="review">([\s\S]*?)<\/blockquote>/g

function plain(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

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
    books: [...shelf.content.matchAll(entryPattern)].map(
      ([, title = "", cover = "", author = "", review = ""]): Book => ({
        title: plain(title),
        author: plain(author),
        cover,
        review: plain(review),
        shelf,
        id: `${shelf.path}#${cover}`,
      })
    ),
  }))

export const allBooks = shelves.flatMap((entry) => entry.books)

/** The first sentence of a review, for a spine's note. */
export function firstSentence(text: string) {
  const match = /^[\s\S]*?[.!?](?=\s|$)/.exec(text)
  return match ? match[0] : text
}
