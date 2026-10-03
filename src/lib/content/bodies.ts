import { loadOnce, settled } from "@/lib/load-once"
import { bodySlug } from "./body-slug"
import type { BodyComponent, Document, Heading } from "./types"

/**
 * Document bodies, one chunk each (see split.ts). A page loads only its own:
 * route loaders await `loadBody` before rendering, and the client entry does
 * the same before hydrating, so rendering never waits on a body.
 */
export type Body = { default: BodyComponent; headings: Heading[] }

const prefix = "../../../.content-collections/split/bodies/"
const modules = import.meta.glob<Body>([
  "../../../.content-collections/split/bodies/*.js",
  "!../../../.content-collections/split/bodies/404.js",
])
/** The 404 body ships with the app: a missing page has no loader to wait on. */
const notFound = import.meta.glob<Body>(
  "../../../.content-collections/split/bodies/404.js",
  { eager: true }
)[`${prefix}404.js`]

const loaders = new Map<string, () => Promise<Body>>()
if (notFound) {
  const ready = settled(notFound)
  loaders.set("/404.html", () => ready)
}

export function loadBody(path: string): Promise<Body> {
  let loader = loaders.get(path)
  if (!loader) {
    const load = modules[`${prefix}${bodySlug(path)}.js`]
    if (!load) throw new Error(`Missing body for ${path}`)
    loader = loadOnce(load)
    loaders.set(path, loader)
  }
  return loader()
}

/** For route loaders: resolves once the document's body (if any) is loaded. */
export async function withBody<T extends Document>(document: T): Promise<T> {
  if (document.hasBody) await loadBody(document.path)
  return document
}
