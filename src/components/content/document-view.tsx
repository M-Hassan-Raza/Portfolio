import { use } from "react"
import type { ReactNode } from "react"
import type { Document } from "@/lib/content/types"
import { withBody } from "@/lib/content/bodies"
import { loadOnce } from "@/lib/load-once"
import { NotFoundView } from "@/components/views/not-found"
import { ContentBody } from "./body"
import { viewOf } from "./view-names"
import type { ViewName } from "./view-names"

/*
 * Each page design is its own chunk, so a blog post doesn't download the book
 * shelf's popover or the open-source page's data. Like bodies, a view is
 * loaded before it renders (route loader, or the client entry before
 * hydration) and its chunk is preloaded in the prerendered HTML.
 */
const views = {
  article: loadOnce(() => import("@/components/views/article")),
  "case-study": loadOnce(() => import("@/components/views/case-study")),
  collections: loadOnce(() => import("@/components/views/collections")),
  about: loadOnce(() => import("@/components/views/about")),
  "open-source": loadOnce(() => import("@/components/views/open-source")),
  pages: loadOnce(() => import("@/components/views/pages")),
  "shelf-page": loadOnce(() => import("@/components/views/shelf-page")),
} satisfies Record<ViewName, () => Promise<unknown>>

/** Resolves once everything DocumentView needs for this document is loaded. */
export async function prepareDocument<T extends Document>(
  document: T
): Promise<T> {
  const view = viewOf(document)
  await Promise.all([withBody(document), view && views[view]()])
  return document
}

/** Picks the page design for a content document. */
export function DocumentView({
  document,
  children,
}: {
  document: Document
  children?: ReactNode
}) {
  switch (document.kind) {
    case "article": {
      const { ArticleView } = use(views.article())
      return <ArticleView document={document} />
    }
    case "project": {
      const { CaseStudyView } = use(views["case-study"]())
      return <CaseStudyView document={document} />
    }
    case "collection": {
      const { CollectionView } = use(views.collections())
      return <CollectionView document={document} />
    }
    case "about": {
      const { AboutView } = use(views.about())
      return <AboutView document={document} />
    }
    case "open-source": {
      const { OpenSourceView } = use(views["open-source"]())
      return <OpenSourceView document={document} />
    }
    case "not-found":
      return <NotFoundView body={<ContentBody path={document.path} />} />
    case "page":
      if (document.path.startsWith("/books/")) {
        const { ShelfPage } = use(views["shelf-page"]())
        return <ShelfPage document={document} />
      }
      break
  }
  const { ArchiveView, ContactView, GenericPage, ResumeView } = use(
    views.pages()
  )
  if (document.kind === "resume") return <ResumeView document={document} />
  if (document.kind === "archive") return <ArchiveView document={document} />
  if (document.path === "/contact/") return <ContactView document={document} />
  return <GenericPage document={document}>{children}</GenericPage>
}
