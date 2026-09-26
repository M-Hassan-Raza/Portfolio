import { Link } from "@tanstack/react-router"
import type { Topic, TaxonomyKind } from "@/lib/content/taxonomies"
import { topics, taxonomyTitle } from "@/lib/content/taxonomies"
import { EntryList } from "@/components/content/entry-list"

export function TaxonomyIndex({ kind }: { kind: TaxonomyKind }) {
  return (
    <section className="space-y-8">
      <h1 className="text-4xl font-semibold">{taxonomyTitle(kind)}</h1>
      <ul className="flex flex-wrap gap-6">
        {topics
          .filter((topic) => topic.kind === kind)
          .map((topic) => (
            <li key={topic.path}>
              <Link
                to={kind === "tags" ? "/tags/$term/" : "/categories/$term/"}
                params={{ term: topic.slug }}
              >
                {topic.label} ({topic.entries.length})
              </Link>
            </li>
          ))}
      </ul>
    </section>
  )
}
export function TopicView({ topic }: { topic: Topic }) {
  return (
    <section className="space-y-8">
      <h1 className="text-4xl font-semibold">{topic.label}</h1>
      <EntryList entries={topic.entries} />
    </section>
  )
}
