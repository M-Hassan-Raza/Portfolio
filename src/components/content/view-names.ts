import type { Document } from "@/lib/content/types"

/** The modules under src/components/views that render content documents. */
export type ViewName =
  | "article"
  | "case-study"
  | "collections"
  | "about"
  | "open-source"
  | "pages"
  | "shelf-page"

/**
 * Which view renders a document, or null when DocumentView doesn't (the home
 * page has its own route). Plain data, so the build can import it too: it
 * preloads each page's view chunk (scripts/static-output.tsx).
 */
export function viewOf(
  document: Pick<Document, "kind" | "path">
): ViewName | null {
  switch (document.kind) {
    case "home":
    case "not-found":
      return null
    case "article":
      return "article"
    case "project":
      return "case-study"
    case "collection":
      return "collections"
    case "about":
      return "about"
    case "open-source":
      return "open-source"
    case "page":
      return document.path.startsWith("/books/") ? "shelf-page" : "pages"
    default:
      return "pages"
  }
}
