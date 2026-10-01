import { documentHead } from "@/lib/metadata"
import { createFileRoute, notFound, redirect } from "@tanstack/react-router"
import { getDocument } from "@/lib/content/catalog"
import { redirects } from "@/lib/content/redirects"
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
  head: ({ loaderData }) => (loaderData ? documentHead(loaderData) : {}),
  component: ContentPage,
})
function ContentPage() {
  return <DocumentView document={Route.useLoaderData()} />
}
