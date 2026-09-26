import Fuse from "fuse.js"
import { searchEntries } from "@/lib/content/search"
import { PageLink } from "@/components/content/page-link"
import { Input } from "@/components/ui/input"

const index = new Fuse(searchEntries, {
  keys: ["title", "description", "text"],
  threshold: 0.35,
  ignoreLocation: true,
})
export function SearchView({
  query,
  onQueryChange,
}: {
  query: string
  onQueryChange: (query: string) => void
}) {
  const results = query.trim() ? index.search(query) : []
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="site-search" className="font-medium">
          Search writing and work
        </label>
        <Input
          id="site-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search posts, projects, and more…"
        />
      </div>
      <p role="status">
        {query.trim() ? `${results.length} results` : "Enter a search term."}
      </p>
      <ul className="space-y-6">
        {results.map(({ item }) => (
          <li key={item.path}>
            <h2 className="text-xl font-medium">
              <PageLink path={item.path}>{item.title}</PageLink>
            </h2>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
