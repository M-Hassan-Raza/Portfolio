import { openSource } from "#content"
import { documents } from "./catalog"

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
          text: document.text,
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
