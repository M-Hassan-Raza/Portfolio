import { createFileRoute } from "@tanstack/react-router"
import { TaxonomyIndex } from "@/components/views/taxonomies"
import { taxonomyTitle } from "@/lib/content/taxonomies"
import { pageHead } from "@/lib/metadata"

export const Route = createFileRoute("/tags/")({
  head: () =>
    pageHead({
      path: "/tags/",
      title: taxonomyTitle("tags"),
      description: "Writing and work grouped by tags.",
    }),
  component: () => <TaxonomyIndex kind="tags" />,
})
