import { useSyncExternalStore } from "react"

/**
 * Reading preferences a visitor can set on top of their OS settings. Each one
 * is a data attribute on <html>, so CSS owns every visual consequence and the
 * boot script can apply them before first paint.
 */
export const textSizes = ["default", "large", "larger"] as const
export type TextSize = (typeof textSizes)[number]

export type Preferences = {
  textSize: TextSize
  reduceMotion: boolean
  moreContrast: boolean
  underlineLinks: boolean
  wideSpacing: boolean
  legibleFont: boolean
}

export type Toggle = Exclude<keyof Preferences, "textSize">

export const defaultPreferences: Preferences = {
  textSize: "default",
  reduceMotion: false,
  moreContrast: false,
  underlineLinks: false,
  wideSpacing: false,
  legibleFont: false,
}

const storageKey = "pref-reading"

/** Toggle → the attribute it sets on <html> when on. */
export const toggleAttributes: Record<Toggle, [string, string]> = {
  reduceMotion: ["data-motion", "reduce"],
  moreContrast: ["data-contrast", "more"],
  underlineLinks: ["data-links", "underline"],
  wideSpacing: ["data-spacing", "wide"],
  legibleFont: ["data-font", "legible"],
}

/** Copy for the settings dialog and the palette, in one place. */
export const toggleCopy: Record<Toggle, { label: string; detail: string }> = {
  reduceMotion: {
    label: "Reduce motion",
    detail: "Stops springs, reveals and page transitions.",
  },
  moreContrast: {
    label: "More contrast",
    detail: "Soft greys become full ink and hairlines get heavier.",
  },
  underlineLinks: {
    label: "Underline links",
    detail: "Every link is underlined, not just the ones in prose.",
  },
  wideSpacing: {
    label: "Wider text spacing",
    detail: "More room between lines, words and letters.",
  },
  legibleFont: {
    label: "Hyperlegible font",
    detail: "Atkinson Hyperlegible, drawn for low-vision readers.",
  },
}

function read(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}")
    return { ...defaultPreferences, ...saved }
  } catch {
    return defaultPreferences
  }
}

function apply(preferences: Preferences) {
  const root = document.documentElement
  if (preferences.textSize === "default") delete root.dataset.text
  else root.dataset.text = preferences.textSize
  for (const [key, [attribute, value]] of Object.entries(toggleAttributes)) {
    if (preferences[key as Toggle]) root.setAttribute(attribute, value)
    else root.removeAttribute(attribute)
  }
}

let current: Preferences | null = null
const listeners = new Set<() => void>()

function snapshot() {
  current ??= read()
  return current
}

export function setPreferences(
  update:
    Partial<Preferences> | ((previous: Preferences) => Partial<Preferences>)
) {
  const previous = snapshot()
  const next = {
    ...previous,
    ...(typeof update === "function" ? update(previous) : update),
  }
  current = next
  apply(next)
  try {
    localStorage.setItem(storageKey, JSON.stringify(next))
  } catch {
    // Private mode: the preference still holds for this page view.
  }
  listeners.forEach((listener) => listener())
}

export function togglePreference(key: Toggle) {
  setPreferences((previous) => ({ [key]: !previous[key] }))
}

export function stepTextSize(direction: 1 | -1) {
  setPreferences((previous) => {
    const index = textSizes.indexOf(previous.textSize) + direction
    return {
      textSize: textSizes[Math.max(0, Math.min(textSizes.length - 1, index))],
    }
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePreferences() {
  return useSyncExternalStore(subscribe, snapshot, () => defaultPreferences)
}

/** True once the visitor asked this site to hold still, whatever the OS says. */
export function prefersStillness() {
  return (
    snapshot().reduceMotion ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

export { subscribe as subscribePreferences }

/**
 * Runs inline in <head> before paint so saved preferences never flash.
 * Mirrors `apply` without importing it.
 */
export const preferencesBootScript = `try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})||"{}"),r=document.documentElement,a=${JSON.stringify(toggleAttributes)};if(p.textSize&&p.textSize!=="default")r.dataset.text=p.textSize;for(var k in a)if(p[k])r.setAttribute(a[k][0],a[k][1])}catch(e){}`
