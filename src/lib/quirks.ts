import { useSyncExternalStore } from "react"

/**
 * Keyboard shortcuts and typed easter eggs. Both the key handler and the
 * cheat sheet read from here, so a shortcut can't exist without its entry.
 */

/** `g` then a letter, the way Gmail and GitHub do it. */
export const goTo = [
  { key: "h", label: "Home", path: "/" },
  { key: "w", label: "Work", path: "/projects/" },
  { key: "b", label: "Writing", path: "/blog/" },
  { key: "o", label: "Open source", path: "/open-source/" },
  { key: "r", label: "Books", path: "/books/" },
  { key: "a", label: "About", path: "/about/" },
  { key: "c", label: "Contact", path: "/contact/" },
  { key: "s", label: "Search", path: "/search/" },
] as const

export type ShortcutRow = { keys: string[][]; label: string }

/** Each inner array is one chord, pressed in sequence. */
export const shortcutGroups: { title: string; rows: ShortcutRow[] }[] = [
  {
    title: "Anywhere",
    rows: [
      { keys: [["⌘", "K"], ["/"]], label: "Search and commands" },
      { keys: [["`"]], label: "Terminal" },
      { keys: [["?"]], label: "This list" },
      { keys: [["Esc"]], label: "Close whatever is open" },
    ],
  },
  {
    title: "Move like vim",
    rows: [
      { keys: [["j"], ["k"]], label: "Scroll down, scroll up" },
      { keys: [["g", "g"]], label: "Top of the page" },
      { keys: [["⇧", "G"]], label: "Bottom of the page" },
      { keys: [["y", "y"]], label: "Yank this page's link" },
    ],
  },
  {
    title: "Go to",
    rows: goTo.map((item) => ({ keys: [["g", item.key]], label: item.label })),
  },
]

/* ── Easter eggs ───────────────────────────────────────────────────────── */

/**
 * `triggers` are typed anywhere on the page (lowercase, spaces dropped).
 * An egg with a `command` opens the terminal and runs it there; the rest
 * play a scene. Eggs without triggers are found inside the terminal or vim.
 */
export const eggs = [
  { id: "konami", name: "Konami code", triggers: ["↑↑↓↓←→←→ba"] },
  { id: "sudo", name: "sudo", triggers: ["sudo"], command: "sudo" },
  {
    id: "sandwich",
    name: "make me a sandwich",
    triggers: ["makemeasandwich"],
    command: "make me a sandwich",
  },
  { id: "sudo-sandwich", name: "sudo make me a sandwich", triggers: [] },
  { id: "leet", name: "1337", triggers: ["1337", "l33t", "leet"] },
  { id: "leetcode", name: "leetcode", triggers: ["leetcode"] },
  {
    id: "rm-rf",
    name: "rm -rf /",
    triggers: ["rm-rf/"],
    command: "rm -rf /",
  },
  { id: "matrix", name: "matrix", triggers: ["matrix"] },
  {
    id: "barrel-roll",
    name: "do a barrel roll",
    triggers: ["doabarrelroll", "barrelroll"],
  },
  { id: "vim", name: "vim", triggers: ["vim"] },
  { id: "vim-quit", name: "Escaped vim", triggers: [] },
  { id: "xyzzy", name: "xyzzy", triggers: ["xyzzy"], command: "xyzzy" },
  {
    id: "teapot",
    name: "418",
    triggers: ["coffee", "418"],
    command: "brew coffee",
  },
  { id: "hire", name: "hire me", triggers: ["hireme"] },
  {
    id: "blame",
    name: "git blame",
    triggers: ["gitblame"],
    command: "git blame",
  },
  { id: "ping", name: "ping", triggers: ["ping"], command: "ping" },
  { id: "sl", name: "sl", triggers: [] },
  { id: "cowsay", name: "cowsay", triggers: [] },
  { id: "indecisive", name: "Light, dark, light, dark", triggers: [] },
] as const satisfies readonly {
  id: string
  name: string
  triggers: readonly string[]
  command?: string
}[]

export type EggId = (typeof eggs)[number]["id"]
export type Egg = (typeof eggs)[number]

/** Arrow keys join the typed buffer as glyphs so the Konami code is just a string. */
const arrowGlyphs: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
}

/** The character a keypress adds to the buffer, "" for space, null for keys that don't count. */
export function bufferChar(event: KeyboardEvent): string | null {
  if (event.metaKey || event.ctrlKey || event.altKey) return null
  if (event.key in arrowGlyphs) return arrowGlyphs[event.key] ?? null
  if (event.key === " ") return ""
  return event.key.length === 1 ? event.key.toLowerCase() : null
}

const triggerList = eggs.flatMap((egg) =>
  egg.triggers.map((trigger) => ({ egg, trigger }))
)

/**
 * Reads the typed buffer.
 * - `match`: the longest trigger the buffer ends with. `wait` is set when a
 *   longer trigger starts with it ("leet" → "leetcode"), so the caller holds
 *   off until typing pauses.
 * - `progress`: how many of the last keys spell the start of some trigger.
 *   Two or more means a secret is being typed, and those keys must not also
 *   act as shortcuts (the "/" in "rm -rf /", the "k" in "make", spaces and
 *   arrows that would scroll the page).
 */
export function readBuffer(buffer: string) {
  let best: (typeof triggerList)[number] | undefined
  let progress = 0
  for (const entry of triggerList) {
    if (
      buffer.endsWith(entry.trigger) &&
      entry.trigger.length > (best?.trigger.length ?? 0)
    )
      best = entry
    for (
      let length = Math.min(buffer.length, entry.trigger.length);
      length > progress;
      length--
    ) {
      if (buffer.endsWith(entry.trigger.slice(0, length))) {
        progress = length
        break
      }
    }
  }
  const typed = best?.trigger
  const wait =
    typed !== undefined &&
    triggerList.some(
      (entry) =>
        entry.trigger.length > typed.length && entry.trigger.startsWith(typed)
    )
  return {
    match: best ? { egg: best.egg, wait } : null,
    progress,
    /** The part of the buffer that is spelling a secret, for the typing HUD. */
    spelled: buffer.slice(buffer.length - progress),
  }
}

/* ── Which ones a visitor has found, kept across visits ───────────────── */

const foundKey = "quirks-found"
let found: EggId[] | null = null
const listeners = new Set<() => void>()
const none: EggId[] = []

function readFound(): EggId[] {
  found ??= (() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(foundKey) ?? "[]")
      return Array.isArray(saved)
        ? eggs.map((egg) => egg.id).filter((id) => saved.includes(id))
        : []
    } catch {
      return []
    }
  })()
  return found
}

/** Records a find. Returns its place in the tally the first time, else null. */
export function markFound(id: EggId): number | null {
  const current = readFound()
  if (current.includes(id)) return null
  found = [...current, id]
  try {
    localStorage.setItem(foundKey, JSON.stringify(found))
  } catch {
    // Not remembered across visits, which is fine.
  }
  listeners.forEach((listener) => listener())
  return found.length
}

export function useFoundEggs() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    readFound,
    () => none
  )
}

/** Keys typed into a field belong to the field. */
export function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  )
}

/** For the palette, where phones can type secrets too: an exact trigger, spaces ignored. */
export function eggForCommand(text: string): Egg | null {
  const typed = text.toLowerCase().replace(/\s+/g, "")
  return triggerList.find((entry) => entry.trigger === typed)?.egg ?? null
}

/** The terminal key: backtick, but never the shifted tilde on the same key, so `cd ~` still types. */
export function isBacktick(event: {
  key: string
  code: string
  shiftKey: boolean
}) {
  return (
    event.key === "`" ||
    (event.code === "Backquote" && !event.shiftKey && event.key !== "~")
  )
}
