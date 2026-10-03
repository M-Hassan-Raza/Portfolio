import { createFileRoute, useHydrated } from "@tanstack/react-router"
import { requireDocument } from "@/lib/content/catalog"
import { documentHead } from "@/lib/metadata"
import {
  DocumentView,
  prepareDocument,
} from "@/components/content/document-view"
import { SearchView } from "@/components/views/search"

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  loader: () => prepareDocument(requireDocument("/search/")),
  head: ({ loaderData }) => (loaderData ? documentHead(loaderData) : {}),
  component: SearchPage,
})
function SearchPage() {
  const { q } = Route.useSearch()
  const hydrated = useHydrated()
  const navigate = Route.useNavigate()
  const document = Route.useLoaderData()
  if (document.kind !== "search")
    throw new Error("Search route requires search content")
  return (
    <DocumentView document={document}>
      <SearchView
        query={hydrated ? q : ""}
        placeholder={document.placeholder}
        onQueryChange={(query) => {
          void navigate({ search: { q: query }, replace: true })
        }}
      />
    </DocumentView>
  )
}
