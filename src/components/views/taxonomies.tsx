import { Link } from "@tanstack/react-router"
import type { Topic, TaxonomyKind } from "@/lib/content/taxonomies"
import { topics, taxonomyTitle } from "@/lib/content/taxonomies"
import { cn } from "@/lib/utils"
import { EntryList } from "@/components/content/entry-list"
import { BlockHero } from "@/components/studio/block-hero"
import { EmptyBlock } from "@/components/studio/empty-block"
import { ArrowLink } from "@/components/studio/section-heading"

export function TaxonomyIndex({ kind }: { kind: TaxonomyKind }) {
  const list = topics.filter((topic) => topic.kind === kind)
  const most = Math.max(1, ...list.map((topic) => topic.entries.length))
  return (
    <div data-block="ultramarine" className="flex flex-col gap-16 pb-24">
      <BlockHero
        block="ultramarine"
        title={taxonomyTitle(kind)}
        lede={`Writing and work grouped by ${kind}. Bigger means more of it.`}
      >
        <ArrowLink to={kind === "tags" ? "/categories/" : "/tags/"}>
          {kind === "tags" ? "Browse categories" : "Browse tags"}
        </ArrowLink>
      </BlockHero>
      <ul className="frame flex flex-wrap items-center gap-3">
        {list.map((topic, index) => {
          const weight = topic.entries.length / most
          return (
            <li key={topic.path}>
              <Link
                to={kind === "tags" ? "/tags/$term/" : "/categories/$term/"}
                params={{ term: topic.slug }}
                className={cn(
                  "pressable-flat inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper-raised px-4 py-2 font-bold text-ink hover:bg-block hover:text-on-block",
                  weight > 0.6
                    ? "text-2xl"
                    : weight > 0.3
                      ? "text-lg"
                      : "text-base"
                )}
                style={{
                  rotate: `${[-1.5, 1, -0.5, 2, 0, -1][index % 6]}deg`,
                }}
              >
                {topic.label}
                <span className="rounded-full bg-ink px-2 text-xs font-bold text-paper tabular">
                  {topic.entries.length}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function TopicView({ topic }: { topic: Topic }) {
  return (
    <div data-block="ultramarine" className="flex flex-col gap-16 pb-24">
      <BlockHero
        block="ultramarine"
        size="l"
        kicker={`${topic.kind === "tags" ? "Tag" : "Category"} · ${topic.entries.length} ${topic.entries.length === 1 ? "entry" : "entries"}`}
        title={topic.label}
      >
        <ArrowLink to={`/${topic.kind}/`}>All {topic.kind}</ArrowLink>
      </BlockHero>
      <div className="frame">
        {topic.entries.length > 0 ? (
          <EntryList entries={topic.entries} />
        ) : (
          <EmptyBlock block="ultramarine" title="Nothing here. Yet.">
            Nothing filed under this one so far.
          </EmptyBlock>
        )}
      </div>
    </div>
  )
}
