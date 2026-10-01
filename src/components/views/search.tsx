import { Link } from "@tanstack/react-router"
import Fuse from "fuse.js"
import { Search } from "lucide-react"
import { searchEntries, searchKindLabel } from "@/lib/content/search"
import { formatDate } from "@/lib/format"
import { blockFor, blockForSection } from "@/lib/studio"
import { EmptyBlock } from "@/components/studio/empty-block"

const index = new Fuse(searchEntries, {
  keys: ["title", "description", "text"],
  threshold: 0.35,
  ignoreLocation: true,
})
export function SearchView({
  query,
  placeholder,
  onQueryChange,
}: {
  query: string
  placeholder: string
  onQueryChange: (query: string) => void
}) {
  const results = query.trim() ? index.search(query) : []
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <label htmlFor="site-search" className="type-label text-ink-soft">
          Search writing and work
        </label>
        <div className="flex h-16 items-center gap-3 rounded-full border-2 border-ink bg-paper-raised px-6 shadow-rest focus-within:shadow-lift focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-ring">
          <Search
            aria-hidden="true"
            className="size-5 shrink-0 text-ink-soft"
            strokeWidth={2.4}
          />
          <input
            id="site-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="h-full min-w-0 flex-1 bg-transparent text-lg font-medium text-ink outline-none placeholder:text-ink-faint focus-visible:shadow-none focus-visible:outline-none"
          />
        </div>
      </div>
      <p role="status" className="font-serif text-lg text-ink-soft">
        {query.trim()
          ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${query.trim()}”`
          : "Type a word. Project names work well."}
      </p>
      {query.trim() && results.length === 0 ? (
        <EmptyBlock block="ultramarine" title="Nothing. Yet.">
          Nothing matches that. Try a project name.
        </EmptyBlock>
      ) : (
        <ul className="flex flex-col border-t-2 border-ink">
          {results.map(({ item }) => (
            <li
              key={item.path}
              data-block={
                item.kind === "page"
                  ? blockForSection(item.path)
                  : blockFor(item.path)
              }
              className="border-b-2 border-ink"
            >
              <Link
                to={item.path}
                className="wipe flex flex-col gap-1.5 px-3 py-4 md:px-5"
              >
                <span className="wipe-soft type-label text-ink-soft">
                  {searchKindLabel[item.kind]}
                  {item.date ? ` · ${formatDate(item.date)}` : ""}
                </span>
                <h2 className="type-h3 text-[1.6rem]">{item.title}</h2>
                <p className="wipe-soft line-clamp-2 font-serif text-ink-soft">
                  {item.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
