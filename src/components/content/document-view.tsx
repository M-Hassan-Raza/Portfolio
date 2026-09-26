import { Comments } from "./comments"
import { taxonomyPath } from "@/lib/content/taxonomies"
import type { ReactNode } from "react"
import type { Document } from "#content"
import { AboutDetails, ResumeDetails } from "@/components/views/profile"
import { OpenSourceView } from "@/components/views/open-source"
import { EntryList } from "./entry-list"
import { documents, getDocument } from "@/lib/content/catalog"
import { CollectionView } from "@/components/views/collections"
import { ContentBody } from "./body"
import { AsciiCover } from "./ascii-cover"
import { PageLink } from "./page-link"

export function DocumentView({
  document,
  children,
}: {
  document: Document
  children?: ReactNode
}) {
  const parentPath = `/${document.path.split("/").filter(Boolean).slice(0, -1).join("/")}/`
  const parent = getDocument(parentPath)
  return (
    <article className="space-y-8">
      <header className="space-y-4">
        {document.breadcrumbs && document.path !== "/" && (
          <nav aria-label="Breadcrumb" className="flex gap-3 text-sm">
            <PageLink path="/">Home</PageLink>
            {parent && <PageLink path={parent.path}>{parent.title}</PageLink>}
          </nav>
        )}
        {document.kind === "project" && document.projectLabel && (
          <p>{document.projectLabel}</p>
        )}
        <h1 className="text-4xl font-semibold tracking-tight">
          {document.title}
        </h1>
        <p className="text-lg text-muted-foreground">{document.description}</p>
        {(document.kind === "article" || document.kind === "project") && (
          <p className="text-sm text-muted-foreground">
            {document.publishedAt && (
              <time dateTime={document.publishedAt}>
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeZone: "UTC",
                }).format(new Date(document.publishedAt))}
              </time>
            )}{" "}
            · {document.readingMinutes} min read
          </p>
        )}
      </header>
      {document.cover && !document.cover.hidden && (
        <figure>
          <AsciiCover
            asset={document.cover.ascii}
            alt={document.cover.alt}
            variant={document.cover.screen ? "screen" : "landscape"}
          />
          {document.cover.caption && (
            <figcaption>{document.cover.caption}</figcaption>
          )}
        </figure>
      )}
      {document.toc && document.headings.length > 0 && (
        <nav aria-label="Table of contents">
          <details>
            <summary>On this page</summary>
            <ul>
              {document.headings
                .filter((heading) => heading.depth <= 3)
                .map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`}>{heading.title}</a>
                  </li>
                ))}
            </ul>
          </details>
        </nav>
      )}
      {document.kind === "project" && (
        <>
          {document.facts && (
            <dl className="grid gap-4 sm:grid-cols-2">
              <Fact label="Role">{document.facts.role}</Fact>
              <Fact label="Team">{document.facts.team}</Fact>
              <Fact label="Timeline">{document.facts.timeline}</Fact>
              <Fact label="Status">{document.facts.status}</Fact>
              <Fact label="Stack">{document.facts.stack?.join(", ")}</Fact>
              {document.facts.source && (
                <div>
                  <dt className="font-medium">Source</dt>
                  <dd>
                    {document.facts.source.url ? (
                      <a href={document.facts.source.url}>
                        {document.facts.source.label}
                      </a>
                    ) : (
                      document.facts.source.label
                    )}
                  </dd>
                </div>
              )}
            </dl>
          )}
          {document.outcomes.length > 0 && (
            <ul className="list-disc space-y-2 pl-6">
              {document.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          )}
        </>
      )}
      <ContentBody code={document.mdx} />
      {children}
      {document.kind === "about" && <AboutDetails />}
      {document.kind === "resume" && <ResumeDetails />}
      {document.kind === "open-source" && <OpenSourceView />}
      {document.kind === "archive" && (
        <EntryList
          entries={documents
            .filter((entry) => entry.publishedAt)
            .sort((a, b) =>
              (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")
            )}
        />
      )}
      {document.kind === "collection" && <CollectionView document={document} />}
      {document.tags.length > 0 && (
        <footer className="flex flex-wrap gap-3">
          {document.tags.map((tag) => (
            <PageLink key={tag} path={taxonomyPath("tags", tag)}>
              {tag}
            </PageLink>
          ))}
        </footer>
      )}
      {document.comments && <Comments path={document.path} />}
    </article>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return children ? (
    <div>
      <dt className="font-medium">{label}</dt>
      <dd>{children}</dd>
    </div>
  ) : null
}
