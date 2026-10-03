import { StrictMode, startTransition } from "react"
import { hydrateRoot } from "react-dom/client"
import { StartClient } from "@tanstack/react-start/client"
import { getDocument } from "@/lib/content/catalog"
import { prepareDocument } from "@/components/content/document-view"

/*
 * TanStack Start's default client entry, plus one step: the page's body and
 * view chunks load before hydration (the prerendered HTML preloads them
 * alongside this script), so hydration never suspends on them and the server
 * HTML stays put. A failed load still hydrates; it retries as it renders.
 */
const page = getDocument(window.location.pathname)
const ready = page
  ? prepareDocument(page).catch(() => undefined)
  : Promise.resolve()

void ready.then(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <StartClient />
      </StrictMode>
    )
  })
})
