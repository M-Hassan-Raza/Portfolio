/**
 * Small, deterministic design helpers for the Sticker Studio direction.
 * Nothing here is random at runtime, so server and client always agree.
 */

export const hues = ["peach", "butter", "lilac", "mint", "sky", "rose"] as const
export type Hue = (typeof hues)[number]

/** Hue means content type. */
export function hueForPath(path: string): Hue {
  if (path.startsWith("/projects/")) return "lilac"
  if (path.startsWith("/blog/")) return "peach"
  if (path.startsWith("/books/")) return "sky"
  if (path.startsWith("/open-source/")) return "mint"
  if (
    path.startsWith("/about/") ||
    path.startsWith("/contact/") ||
    path.startsWith("/resume/")
  )
    return "rose"
  return "butter"
}

/** The fixed tilt sequence. Cards pick by index, never by chance. */
const tilts = [-2.5, 1.5, -1, 3, -1.75, 2] as const
export function tiltAt(index: number) {
  return tilts[index % tilts.length] ?? 0
}

/** A small stable hash, for picking a spine colour from a title. */
export function hashOf(text: string) {
  let hash = 2166136261
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function hueFromText(text: string): Hue {
  return hues[hashOf(text) % hues.length] ?? "peach"
}

/** Widens a literal site path for router links that point at content pages. */
export function page(path: string): string {
  return path
}
