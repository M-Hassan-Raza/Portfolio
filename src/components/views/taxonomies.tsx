import { Link } from "@tanstack/react-router"
import type { Topic, TaxonomyKind } from "@/lib/content/taxonomies"
import { topics, taxonomyTitle } from "@/lib/content/taxonomies"
import { hues } from "@/lib/studio"
import { EntryList } from "@/components/content/entry-list"
import { EmptyState } from "@/components/studio/characters"
import { Band, PageHero } from "@/components/studio/page-hero"
import { bandShapes } from "@/components/studio/shape-presets"
import { SwappedWord } from "@/components/studio/swapped-word"
import { ArrowLink } from "@/components/studio/section-heading"
import { headlineFor } from "./headlines"
import { cn } from "@/lib/utils"

export function TaxonomyIndex({ kind }: { kind: TaxonomyKind }) {
  const list = topics.filter((topic) => topic.kind === kind)
  const most = Math.max(1, ...list.map((topic) => topic.entries.length))
  return (
    <div data-hue="butter" className="flex flex-col gap-16 pb-8">
      <PageHero
        hue="butter"
        title={taxonomyTitle(kind)}
        headline={headlineFor(`/${kind}/`, taxonomyTitle(kind))}
        lede={`Writing and work grouped by ${kind}. Bigger means more of it.`}
        shapes={bandShapes("butter", 1)}
      >
        <ArrowLink to={kind === "tags" ? "/categories/" : "/tags/"}>
          {kind === "tags" ? "Browse categories" : "Browse tags"}
        </ArrowLink>
      </PageHero>
      <ul className="frame flex flex-wrap items-center justify-center gap-3">
        {list.map((topic, index) => {
          const weight = topic.entries.length / most
          return (
            <li key={topic.path}>
              <Link
                to={kind === "tags" ? "/tags/$term/" : "/categories/$term/"}
                params={{ term: topic.slug }}
                data-hue={hues[index % hues.length]}
                className={cn(
                  "pressable inline-flex items-center gap-2 rounded-full bg-hue-tint px-4 py-2 font-semibold text-ink hover:bg-hue",
                  weight > 0.6
                    ? "text-2xl"
                    : weight > 0.3
                      ? "text-lg"
                      : "text-base"
                )}
                style={{
                  rotate: `${[-2, 1.5, -1, 2.5, 0, -1.5][index % 6]}deg`,
                }}
              >
                {topic.label}
                <span className="rounded-full bg-paper-raised px-2 text-xs font-bold text-ink-soft tabular">
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
    <div data-hue="butter" className="flex flex-col gap-16 pb-8">
      <Band hue="butter" shapes={bandShapes("butter", 2)}>
        <div className="flex flex-col gap-4">
          <p className="inline-flex items-center gap-2.5 type-label text-sm text-hue-deep">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-hue" />
            {topic.kind === "tags" ? "Tag" : "Category"} ·{" "}
            {topic.entries.length}{" "}
            {topic.entries.length === 1 ? "entry" : "entries"}
          </p>
          <h1 className="type-display text-ink">
            Filed under <SwappedWord hue="butter">{topic.label}</SwappedWord>
          </h1>
          <div className="flex pt-4">
            <ArrowLink to={`/${topic.kind}/`}>All {topic.kind}</ArrowLink>
          </div>
        </div>
      </Band>
      <div className="frame">
        {topic.entries.length > 0 ? (
          <EntryList entries={topic.entries} />
        ) : (
          <EmptyState>Nothing filed here yet. Soon.</EmptyState>
        )}
      </div>
    </div>
  )
}
