import { documents } from "./catalog"

export const searchEntries = documents
  .filter((document) => ["article", "project", "page"].includes(document.kind))
  .map(({ path, title, description, text }) => ({
    path,
    title,
    description,
    text,
  }))
