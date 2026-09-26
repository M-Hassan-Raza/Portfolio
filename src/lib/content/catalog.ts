import { allDocuments } from "content-collections"
import type { Document } from "content-collections"

export const documents = allDocuments.filter(
  (document) =>
    !document.draft &&
    (!document.publishedAt || Date.parse(document.publishedAt) <= Date.now())
)
const byPath = new Map<string, Document>()
export const redirects = new Map<string, string>()
for (const document of documents) {
  if (byPath.has(document.path))
    throw new Error(`Duplicate content path: ${document.path}`)
  byPath.set(document.path, document)
  for (const alias of document.aliases) {
    if (redirects.has(alias)) throw new Error(`Duplicate alias: ${alias}`)
    redirects.set(alias, document.path)
  }
}
for (const alias of redirects.keys()) {
  if (byPath.has(alias))
    throw new Error(`Alias collides with content: ${alias}`)
}
export function getDocument(path: string) {
  return byPath.get(path)
}
export function requireDocument(path: string) {
  const document = getDocument(path)
  if (!document) throw new Error(`Missing content: ${path}`)
  return document
}
export const articles = documents
  .filter((document) => document.kind === "article")
  .sort(
    (a, b) =>
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") ||
      a.path.localeCompare(b.path)
  )
export const projects = documents
  .filter((document) => document.kind === "project")
  .sort((a, b) => a.weight - b.weight || a.title.localeCompare(b.title))
export const books = documents.filter(
  (document) => document.kind === "page" && document.path.startsWith("/books/")
)
