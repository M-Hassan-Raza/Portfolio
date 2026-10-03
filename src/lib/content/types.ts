import type { ComponentType } from "react"
import type { Document as BuiltDocument } from "#content"

/**
 * A document as pages see it: everything except the body, its source and its
 * search text. Bodies load per page (src/lib/content/bodies.ts) and search
 * text loads with search (src/lib/content/search.ts).
 */
export type Document = WithoutBody<BuiltDocument>
type WithoutBody<T> = T extends unknown
  ? Omit<T, "mdx" | "content" | "text" | "headings" | "_meta"> & {
      hasToc: boolean
    }
  : never

export type Heading = BuiltDocument["headings"][number]

/** A compiled MDX body; `components` swaps in the site's own elements. */
export type BodyComponent = ComponentType<{
  components?: Record<string, ComponentType<never>>
}>
