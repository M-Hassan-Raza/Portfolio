import type { Document } from "@/lib/content/types"
import { IndexList } from "@/components/studio/index-list"
import { entryRow } from "./cards"

/** Any list of documents, as hover-flood rows. */
export function EntryList({
  entries,
  size = "compact",
}: {
  entries: readonly Document[]
  size?: "large" | "compact"
}) {
  return (
    <IndexList rows={entries.map((entry) => entryRow(entry))} size={size} />
  )
}
