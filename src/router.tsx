import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { prefersStillness } from "@/lib/preferences"

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    trailingSlash: "always",
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    // Cross-fade between pages; hash-only jumps (TOC links) stay instant.
    // Skipped on weak machines and for reduced motion: a view transition
    // snapshots the whole page (and every named cover) before it can start.
    defaultViewTransition: {
      types: ({ pathChanged }) =>
        pathChanged &&
        document.documentElement.dataset.perf !== "low" &&
        !prefersStillness()
          ? ["page"]
          : false,
    },
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
