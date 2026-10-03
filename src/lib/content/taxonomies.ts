import { topicSlugs } from "#content/topic-slugs"
import { documents } from "./catalog"
import type { Document } from "./types"

export type TaxonomyKind = "tags" | "categories"
export type Topic = {
  kind: TaxonomyKind
  label: string
  path: string
  slug: string
  entries: Document[]
}
/** Slugs are made at content build time (split.ts) for every label in use. */
export function taxonomyPath(kind: TaxonomyKind, label: string) {
  const slug = topicSlugs[label]
  if (slug === undefined) throw new Error(`No slug for topic: ${label}`)
  return `/${kind}/${slug}/`
}
const byPath = new Map<string, Topic>()
for (const document of documents) {
  for (const kind of ["tags", "categories"] as const) {
    for (const label of document[kind]) {
      const path = taxonomyPath(kind, label)
      let topic = byPath.get(path)
      if (!topic) {
        topic = {
          kind,
          label,
          path,
          slug: path.split("/")[2] ?? "",
          entries: [],
        }
        byPath.set(path, topic)
      }
      if (topic.label.toLowerCase() !== label.toLowerCase())
        throw new Error(`Taxonomy slug collision: ${label} and ${topic.label}`)
      topic.entries.push(document)
    }
  }
}
export const topics = [...byPath.values()].sort((a, b) =>
  a.label.localeCompare(b.label)
)
export function getTopic(kind: TaxonomyKind, slug: string) {
  return byPath.get(`/${kind}/${slug}/`)
}
export function taxonomyTitle(kind: TaxonomyKind) {
  return kind === "tags" ? "Tags" : "Categories"
}
export function topicHead(topic: Topic) {
  return {
    title: topic.label,
    path: topic.path,
    description: `Writing and work about ${topic.label}.`,
  }
}
