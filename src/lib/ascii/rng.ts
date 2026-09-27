/**
 * Stateless integer hashing: every random decision is a pure function of
 * (seed, cell, time-bucket), so effects are reproducible per asset and never
 * "boil" faster than the tick rate. This is what keeps noise from reading as TV static.
 */
export function hash32(a: number, b = 0, c = 0): number {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b)
  h = Math.imul(h ^ (b + 0x7f4a7c15), 0xc2b2ae35)
  h = Math.imul(h ^ (c + 0x165667b1), 0x27d4eb2f)
  h ^= h >>> 15
  h = Math.imul(h, 0x2c1b3c6d)
  h ^= h >>> 12
  return h >>> 0
}
export const hash01 = (a: number, b = 0, c = 0) => hash32(a, b, c) / 4294967296

/** FNV-1a so the seed can come from the asset key: same art, same choreography. */
export function seedFrom(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++)
    h = Math.imul(h ^ text.charCodeAt(i), 0x01000193)
  return h >>> 0
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const smoothstep = (e0: number, e1: number, v: number) => {
  const t = clamp01((v - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
