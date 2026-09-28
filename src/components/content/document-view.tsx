import type { ReactNode } from "react"
import type { Document } from "#content"
import { AboutView } from "@/components/views/about"
import { ArticleView } from "@/components/views/article"
import { CaseStudyView } from "@/components/views/case-study"
import { CollectionView } from "@/components/views/collections"
import { NotFoundView } from "@/components/views/not-found"
import { ContentBody } from "./body"
import { OpenSourceView } from "@/components/views/open-source"
import {
  ArchiveView,
  ContactView,
  GenericPage,
  ResumeView,
  ShelfPage,
} from "@/components/views/pages"

/** Picks the page design for a content document. */
export function DocumentView({
  document,
  children,
}: {
  document: Document
  children?: ReactNode
}) {
  switch (document.kind) {
    case "article":
      return <ArticleView document={document} />
    case "project":
      return <CaseStudyView document={document} />
    case "collection":
      return <CollectionView document={document} />
    case "about":
      return <AboutView document={document} />
    case "resume":
      return <ResumeView document={document} />
    case "open-source":
      return <OpenSourceView document={document} />
    case "archive":
      return <ArchiveView document={document} />
    case "not-found":
      return <NotFoundView body={<ContentBody code={document.mdx} />} />
    case "page":
      if (document.path === "/contact/")
        return <ContactView document={document} />
      if (document.path.startsWith("/books/"))
        return <ShelfPage document={document} />
      return <GenericPage document={document}>{children}</GenericPage>
    default:
      return (
        <GenericPage document={document} variant={1}>
          {children}
        </GenericPage>
      )
  }
}
