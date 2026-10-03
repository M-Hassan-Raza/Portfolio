import { openSource } from "#content"
import { texts } from "#content/text"
import { documents } from "./catalog"

/*
 * Full-text search data. Heavy (every body as plain text), so only search
 * imports it: the palette loads it on first open, /search/ with its route.
 */

export type SearchKind = "essay" | "project" | "page" | "pull-request"

export type SearchEntry = {
  path: string
  title: string
  description: string
  text: string
  kind: SearchKind
  date?: string
  cover?: string
}

const kindOf = {
  article: "essay",
  project: "project",
  page: "page",
} as const

export const searchEntries: SearchEntry[] = documents.flatMap((document) =>
  document.kind === "article" ||
  document.kind === "project" ||
  document.kind === "page"
    ? [
        {
          path: document.path,
          title: document.title,
          description: document.description,
          text: texts[document.path] ?? "",
          kind: kindOf[document.kind],
          ...(document.publishedAt && { date: document.publishedAt }),
          ...(document.cover && { cover: document.cover.ascii }),
        },
      ]
    : []
)

/** Merged pull requests, searchable by title and project. External URLs. */
export const pullRequestEntries: SearchEntry[] = openSource.projects.flatMap(
  (project) =>
    project.prs.map((pr) => ({
      path: pr.url,
      title: pr.title,
      description: `${project.name} #${pr.number}`,
      text: project.repo,
      kind: "pull-request" as const,
      date: pr.merged,
    }))
)

export const searchKindLabel: Record<SearchKind, string> = {
  essay: "Essay",
  project: "Case study",
  page: "Page",
  "pull-request": "PR",
}
