import type { Plugin, Rollup } from "vite"

/** Where the client build records the chunks each page loads on demand. */
export const pageChunksFile = ".vite/page-chunks.json"
/** Where the post-build step keeps that record, outside the published files. */
export const pageChunksRecord = "dist/page-chunks.json"

/** `{ bodies: { [bodySlug]: files }, views: { [viewName]: files } }` */
export type PageChunks = {
  bodies: Record<string, string[]>
  views: Record<string, string[]>
}

/**
 * Document bodies and page views are dynamic imports, so the HTML TanStack
 * prerenders doesn't preload them. This records, for the client build, each
 * one's chunk and the chunks it statically imports (minus the app entry), so
 * the post-build step (scripts/static-output.tsx) can preload exactly what a
 * page needs alongside the app's own scripts.
 */
export function pageChunks(): Plugin {
  return {
    name: "portfolio:page-chunks",
    applyToEnvironment: (environment) => environment.name === "client",
    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle).filter(
        (output): output is Rollup.OutputChunk => output.type === "chunk"
      )
      const record: PageChunks = { bodies: {}, views: {} }
      for (const chunk of chunks) {
        const id = chunk.facadeModuleId ?? ""
        const body = /\.content-collections\/split\/bodies\/([^/]+)\.js$/.exec(
          id
        )?.[1]
        const view = /\/src\/components\/views\/([^/]+)\.tsx$/.exec(id)?.[1]
        if (body) record.bodies[body] = filesFor(chunk, bundle)
        else if (view) record.views[view] = filesFor(chunk, bundle)
      }
      this.emitFile({
        type: "asset",
        fileName: pageChunksFile,
        source: `${JSON.stringify(record, null, 2)}\n`,
      })
    },
  }
}

/** The chunk and everything it statically imports, entry excluded. */
function filesFor(chunk: Rollup.OutputChunk, bundle: Rollup.OutputBundle) {
  const files = new Set<string>()
  const visit = (current: Rollup.OutputChunk) => {
    if (current.isEntry || files.has(`/${current.fileName}`)) return
    files.add(`/${current.fileName}`)
    for (const name of current.imports) {
      const next = bundle[name]
      if (next?.type === "chunk") visit(next)
    }
  }
  visit(chunk)
  return [...files]
}
