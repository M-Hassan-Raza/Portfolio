import { createFileRoute, notFound, redirect } from "@tanstack/react-router"
import { getDocument, redirects } from "@/lib/content/catalog"
import { DocumentView } from "@/components/content/document-view"

export const Route = createFileRoute("/$")({
  loader: ({ params }) => {
    const path = `/${(params._splat ?? "").replace(/\/$/, "")}/`
    const target = redirects.get(path)
    if (target)
      throw redirect({
        to: "/$/",
        params: { _splat: target.slice(1).replace(/\/$/, "") },
        statusCode: 301,
      })
    const document = getDocument(path)
    if (!document) throw notFound()
    return document
  },
  component: ContentPage,
})
function ContentPage() {
  return <DocumentView document={Route.useLoaderData()} />
}
