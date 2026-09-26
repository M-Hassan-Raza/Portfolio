import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { requireDocument } from "@/lib/content/catalog"
import { documentHead } from "@/lib/metadata"
import { DocumentView } from "@/components/content/document-view"
import { SearchView } from "@/components/views/search"

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().catch("") }),
  loader: () => requireDocument("/search/"),
  head: ({ loaderData }) => (loaderData ? documentHead(loaderData) : {}),
  component: SearchPage,
})
function SearchPage() {
  const { q } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <DocumentView document={Route.useLoaderData()}>
      <SearchView
        query={q}
        onQueryChange={(query) => {
          void navigate({ search: { q: query }, replace: true })
        }}
      />
    </DocumentView>
  )
}
