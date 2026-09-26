import type { Document } from "#content"
import { PageLink } from "./page-link"

export function EntryList({ entries }: { entries: readonly Document[] }) {
  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => (
        <li key={entry.path} className="space-y-2 py-5">
          <h3 className="text-xl font-medium">
            <PageLink path={entry.path}>{entry.title}</PageLink>
          </h3>
          <p className="text-muted-foreground">{entry.description}</p>
          {entry.publishedAt && (
            <time className="text-sm" dateTime={entry.publishedAt}>
              {entry.publishedAt.slice(0, 10)}
            </time>
          )}
        </li>
      ))}
    </ul>
  )
}
