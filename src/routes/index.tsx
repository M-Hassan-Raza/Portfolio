import { createFileRoute } from "@tanstack/react-router"
import { documents } from "@/lib/content/catalog"
import { HomeView } from "@/components/views/home"

export const Route = createFileRoute("/")({
  loader: () => {
    const home = documents.find((document) => document.kind === "home")
    if (!home) throw new Error("Missing homepage content")
    return home
  },
  component: Home,
})
function Home() {
  return <HomeView document={Route.useLoaderData()} />
}
