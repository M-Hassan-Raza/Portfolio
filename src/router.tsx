import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    trailingSlash: "always",
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    // Cross-fade between pages; hash-only jumps (TOC links) stay instant.
    defaultViewTransition: {
      types: ({ pathChanged }) => (pathChanged ? ["page"] : false),
    },
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
