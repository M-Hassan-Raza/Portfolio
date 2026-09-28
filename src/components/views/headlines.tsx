import type { ReactNode } from "react"
import type { Hue } from "@/lib/studio"
import { hueForPath } from "@/lib/studio"
import { SwappedWord } from "@/components/studio/swapped-word"

/**
 * Each page's display line. The page title stays the h1; this is the big,
 * friendlier sentence under it, with exactly one swapped word.
 */
const lines: Record<string, [string, string, string]> = {
  "/projects/": ["Things I ", "built", ""],
  "/blog/": ["Notes on ", "building", ""],
  "/books/": ["Books that ", "stuck", ""],
  "/open-source/": ["Code I ", "gave away", ""],
  "/teaching/": ["Labs, TAs and the ", "debugging", " in between"],
  "/resume/": ["The ", "short", " version"],
  "/archives/": ["Everything, ", "in order", ""],
  "/search/": ["Find the ", "thing", " you half remember"],
  "/privacy-policy/": ["Very little is ", "collected", ""],
  "/dmca/": ["Takedowns, ", "politely", ""],
  "/tags/": ["Sorted by ", "topic", ""],
  "/categories/": ["Sorted by ", "shelf", ""],
  "/books/books-technical/": ["The ", "technical", " shelf"],
  "/books/books-fiction/": ["The ", "fiction", " shelf"],
  "/books/books-non-fiction/": ["The ", "non-fiction", " shelf"],
  "/books/books-pakistan/": ["Books on ", "home", ""],
}

export function headlineFor(path: string, title: string): ReactNode {
  const hue: Hue = hueForPath(path)
  const line = lines[path]
  if (!line) {
    const words = title.split(" ")
    const last = words.pop() ?? title
    return (
      <>
        {words.length > 0 && `${words.join(" ")} `}
        <SwappedWord hue={hue}>{last}</SwappedWord>
      </>
    )
  }
  const [before, word, after] = line
  return (
    <>
      {before}
      <SwappedWord hue={hue}>{word}</SwappedWord>
      {after}
    </>
  )
}
