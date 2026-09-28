import type { Document } from "#content"
import { hueForPath } from "@/lib/studio"
import { Settle } from "@/components/studio/motion"
import { EssayRow } from "./cards"

/** Any list of documents, as stamp rows. Only the first six animate in. */
export function EntryList({ entries }: { entries: readonly Document[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry, index) => (
        <Settle as="li" key={entry.path} index={index < 6 ? index : 0}>
          <EssayRow entry={entry} hue={hueForPath(entry.path)} />
        </Settle>
      ))}
    </ul>
  )
}
