/** One book as authored in a shelf page: title, author, cover and review. */
export type ShelfEntry = {
  title: string
  author: string
  cover: string
  review: string
}

const entryPattern =
  /###\s*<span className="book-subtitle">([\s\S]*?)<\/span>[\s\S]*?asset="([a-z0-9-]+)"[\s\S]*?<p className="author">Author:\s*([\s\S]*?)<\/p>[\s\S]*?<blockquote className="review">([\s\S]*?)<\/blockquote>/g

function plain(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Reads the books out of a shelf page's MDX source. Runs at content build
 * time, so pages never ship the source just to list its books.
 */
export function readShelf(source: string): ShelfEntry[] {
  return [...source.matchAll(entryPattern)].map(
    ([, title = "", cover = "", author = "", review = ""]) => ({
      title: plain(title),
      author: plain(author),
      cover,
      review: plain(review),
    })
  )
}
