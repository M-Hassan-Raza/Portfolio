import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-3xl font-semibold">Muhammad Hassan Raza</h1>
      <p>Product, engineering, and software that has to hold up.</p>
      <Button render={<a href="mailto:hi@mhassan.dev" />}>Get in touch</Button>
    </main>
  )
}
