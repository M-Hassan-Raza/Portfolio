import { Link } from "@tanstack/react-router"
import Fuse from "fuse.js"
import { Search } from "lucide-react"
import { searchEntries, searchKindLabel } from "@/lib/content/search"
import { formatDate } from "@/lib/format"
import { hashOf, hueForPath } from "@/lib/studio"
import { EmptyState } from "@/components/studio/characters"
import { Shape, shapeNames } from "@/components/studio/shape"

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
        <div className="flex h-16 items-center gap-3 rounded-full border-[1.5px] border-ink bg-paper-raised px-6 shadow-rest focus-within:shadow-lift focus-within:outline-[2.5px] focus-within:outline-offset-3 focus-within:outline-ring">
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
      <p role="status" className="type-annotation text-lg text-ink-soft">
        {query.trim()
          ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${query.trim()}”`
          : "Type a word. Project names work well."}
      </p>
      {query.trim() && results.length === 0 ? (
        <EmptyState shape="notch">
          Nothing matches that. Try a project name.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {results.map(({ item }) => {
            const hash = hashOf(item.path)
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="group grid grid-cols-[3rem_1fr] items-start gap-5 rounded-lg bg-paper-raised p-5 transition-[transform,box-shadow] duration-300 ease-(--ease-settle) hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <span
                    data-hue={hueForPath(item.path)}
                    className="block size-12 text-hue transition-transform duration-500 ease-(--ease-pop) group-hover:rotate-12"
                  >
                    <Shape
                      name={shapeNames[hash % shapeNames.length] ?? "circle"}
                      className="size-full"
                    />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1.5">
                    <span className="type-label text-ink-faint">
                      {searchKindLabel[item.kind]}
                      {item.date ? ` · ${formatDate(item.date)}` : ""}
                    </span>
                    <h2 className="type-serif-title text-xl text-ink">
                      {item.title}
                    </h2>
                    <p className="line-clamp-2 text-[0.95rem] text-ink-soft">
                      {item.description}
                    </p>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
