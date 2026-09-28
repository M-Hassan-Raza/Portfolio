/**
 * Small, deterministic design helpers. Nothing here is random at runtime,
 * so server and client always agree.
 */

export const blockNames = [
  "tomato",
  "ultramarine",
  "grass",
  "lemon",
  "violet",
  "pink",
] as const
export type BlockName = (typeof blockNames)[number]
export type Surface = BlockName | "paper" | "ink"

/** Section colour: work tomato, writing ultramarine, open source grass, books lemon, about violet, contact pink. */
const sectionPrefixes: [string, Surface][] = [
  ["/projects/", "tomato"],
  ["/blog/", "ultramarine"],
  ["/archives/", "ultramarine"],
  ["/tags/", "ultramarine"],
  ["/categories/", "ultramarine"],
  ["/search/", "ultramarine"],
  ["/open-source/", "grass"],
  ["/books/", "lemon"],
  ["/about/", "violet"],
  ["/resume/", "violet"],
  ["/teaching/", "violet"],
  ["/contact/", "pink"],
]

export function blockForSection(pathname: string): Surface {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`
  return (
    sectionPrefixes.find(([prefix]) => path.startsWith(prefix))?.[1] ?? "ink"
  )
}

/** A small stable hash, for picking a colour or a spine from a title. */
export function hashOf(text: string) {
  let hash = 2166136261
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Hand-picked where it matters; everything else is a stable hash of the path. */
const curated: Record<string, BlockName> = {
  "/projects/obelisk/": "ultramarine",
  "/projects/polaris/": "lemon",
  "/projects/october/": "pink",
  "/projects/anatomia/": "grass",
  "/projects/risq/": "tomato",
  "/projects/bonnet/": "violet",
  "/blog/war-stories-from-production/": "tomato",
  "/blog/langgraph-multi-agent-middleware/": "violet",
  "/blog/llms-cant-save-bad-ux/": "pink",
  "/blog/best-way-to-learn-a-codebase/": "grass",
}

/** The block a single piece (essay, project) wears everywhere it appears. */
export function blockFor(key: string): BlockName {
  return curated[key] ?? blockNames[hashOf(key) % blockNames.length] ?? "tomato"
}

/** The fixed tilt sequence. Cards pick by index, never by chance. */
const tilts = [-2.5, 1.5, -1, 2.5, -1.75, 2] as const
export function tiltAt(index: number) {
  return tilts[index % tilts.length] ?? 0
}

/** Widens a literal site path for router links that point at content pages. */
export function page(path: string): string {
  return path
}
