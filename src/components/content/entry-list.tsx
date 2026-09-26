import { Link } from "@tanstack/react-router"
import type { Document } from "#content"

export function EntryList({ entries }: { entries: readonly Document[] }) {
  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => (
        <li key={entry.path} className="space-y-2 py-5">
          <h3 className="text-xl font-medium">
            <Link to={entry.path}>{entry.title}</Link>
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
