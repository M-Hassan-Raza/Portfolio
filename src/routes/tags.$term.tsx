import { createFileRoute, notFound } from "@tanstack/react-router"
import { TopicView } from "@/components/views/taxonomies"
import { getTopic, topicHead } from "@/lib/content/taxonomies"
import { pageHead } from "@/lib/metadata"

export const Route = createFileRoute("/tags/$term")({
  loader: ({ params }) => {
    const topic = getTopic("tags", params.term)
    if (!topic) throw notFound()
    return topic
  },
  head: ({ loaderData }) => (loaderData ? pageHead(topicHead(loaderData)) : {}),
  component: TopicPage,
})
function TopicPage() {
  return <TopicView topic={Route.useLoaderData()} />
}
