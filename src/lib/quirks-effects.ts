import { SCRAMBLE_GLYPHS } from "@/lib/ascii/scramble"

/**
 * Whole-page effects for the easter eggs. Each one only borrows the DOM for a
 * few seconds and hands it back exactly as it found it.
 */

const appRoot = () => document.querySelector<HTMLElement>("[data-app-root]")
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
const frame = () => new Promise(requestAnimationFrame)

/* ── 1337 ──────────────────────────────────────────────────────────────── */

const leetMap: Record<string, string> = {
  a: "4",
  e: "3",
  i: "1",
  o: "0",
  s: "5",
  t: "7",
  b: "8",
  g: "9",
}
const leetable = /[aeiostbg]/gi

const leetify = (text: string) =>
  text.replace(leetable, (char) => leetMap[char.toLowerCase()] ?? char)

const garble = (text: string) =>
  text.replace(
    leetable,
    () =>
      SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)] ?? "#"
  )

/**
 * Rewrites visible text in leetspeak. Each node decodes through a frame of
 * scramble glyphs, a batch per frame, so it ripples down the page; headings
 * glitch while it holds; then every node decodes back. A node React changed
 * in the meantime keeps React's text.
 */
export async function leetMode(holdMs = 6000, still = false) {
  const root = appRoot()
  if (!root) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.nodeValue?.trim() &&
      !node.parentElement?.closest("pre, code, script, style, .ascii-frame")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  })
  const swaps: { node: Text; before: string; after: string }[] = []
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const before = node.nodeValue ?? ""
    const after = leetify(before)
    if (after !== before) swaps.push({ node, before, after })
  }

  const ripple = async (from: "before" | "after", to: "before" | "after") => {
    const batch = 18
    for (let index = 0; index < swaps.length; index += batch) {
      const group = swaps
        .slice(index, index + batch)
        .filter((swap) => swap.node.nodeValue === swap[from])
      if (!still) {
        for (const swap of group) swap.node.nodeValue = garble(swap.before)
        await frame()
        await frame()
      }
      for (const swap of group) swap.node.nodeValue = swap[to]
      await frame()
    }
  }

  const html = document.documentElement
  await ripple("before", "after")
  if (!still) html.dataset.quirk = "leet"
  await wait(holdMs)
  delete html.dataset.quirk
  await ripple("after", "before")
}

/* ── rm -rf / ──────────────────────────────────────────────────────────── */

/** Descends from <main> until there are enough pieces to make a good mess. */
function rubble(): HTMLElement[] {
  const header = document.querySelector<HTMLElement>("header")
  const footer = document.querySelector<HTMLElement>("footer")
  let pieces = Array.from(
    document.querySelectorAll<HTMLElement>("#main-content > *")
  )
  while (pieces.length > 0 && pieces.length < 4) {
    const children = pieces.flatMap(
      (piece) => Array.from(piece.children) as HTMLElement[]
    )
    if (children.length <= pieces.length) break
    pieces = children
  }
  const inView = pieces.filter((piece) => {
    const box = piece.getBoundingClientRect()
    return box.bottom > 0 && box.top < window.innerHeight
  })
  return [header?.firstElementChild, ...inView, footer].filter(
    (piece): piece is HTMLElement => piece instanceof HTMLElement
  )
}

/**
 * Everything on screen drops off the bottom. Resolves once the screen is
 * empty, with a function that brings it all back.
 */
export async function fall(): Promise<() => Promise<void>> {
  const pieces = rubble()
  const html = document.documentElement
  html.dataset.quirk = "collapse"
  const falls = pieces.map((piece, index) => {
    const tilt = (index % 2 === 0 ? -1 : 1) * (8 + ((index * 7) % 22))
    const drift = ((index * 37) % 80) - 40
    return piece.animate(
      [
        { transform: "none" },
        { transform: `translate(0, -14px) rotate(${tilt * 0.15}deg)` },
        {
          transform: `translate(${drift}px, ${window.innerHeight * 1.3}px) rotate(${tilt}deg)`,
        },
      ],
      {
        duration: 1100,
        delay: 160 + index * 80,
        easing: "cubic-bezier(0.55, 0, 1, 0.45)",
        fill: "forwards",
      }
    )
  })
  await Promise.all(falls.map((piece) => piece.finished))
  return async () => {
    for (const piece of falls) {
      piece.effect?.updateTiming({ easing: "cubic-bezier(0.22, 1, 0.36, 1)" })
      piece.updatePlaybackRate(1.7)
      piece.reverse()
    }
    await Promise.all(falls.map((piece) => piece.finished))
    falls.forEach((piece) => piece.cancel())
    delete html.dataset.quirk
  }
}

/* ── do a barrel roll ──────────────────────────────────────────────────── */

/** One full turn; the page pulls back mid-roll so the corners stay on screen. */
export async function barrelRoll() {
  const root = appRoot()
  if (!root) return
  document.documentElement.dataset.quirk = "roll"
  await root.animate(
    [
      { transform: "rotate(0turn) scale(1)" },
      { transform: "rotate(0.5turn) scale(0.72)", offset: 0.5 },
      { transform: "rotate(1turn) scale(1)" },
    ],
    { duration: 1500, easing: "cubic-bezier(0.83, 0, 0.17, 1)" }
  ).finished
  delete document.documentElement.dataset.quirk
}

/** A short jolt, for impacts. */
export function jolt() {
  appRoot()?.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: "translate(-6px, 4px)" },
      { transform: "translate(5px, -3px)" },
      { transform: "translate(-3px, 2px)" },
      { transform: "translate(0, 0)" },
    ],
    { duration: 360, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
  )
}

/* ── ping ──────────────────────────────────────────────────────────────── */

/** Round trip to the origin and back, for an honest number. */
export async function ping() {
  const start = performance.now()
  try {
    await fetch(`/assets/favicon.svg?ping=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
    })
  } catch {
    return null
  }
  return performance.now() - start
}
