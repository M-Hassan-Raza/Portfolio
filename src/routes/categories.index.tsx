import { createFileRoute } from "@tanstack/react-router"
import { TaxonomyIndex } from "@/components/views/taxonomies"
import { taxonomyTitle } from "@/lib/content/taxonomies"
import { pageHead } from "@/lib/metadata"

export const Route = createFileRoute("/categories/")({
  head: () =>
    pageHead({
      path: "/categories/",
      title: taxonomyTitle("categories"),
      description: "Writing and work grouped by categories.",
    }),
  component: () => <TaxonomyIndex kind="categories" />,
})
