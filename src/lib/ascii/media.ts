import { useSyncExternalStore } from "react"
import { usePreferences } from "@/lib/preferences"

function mediaStore(query: string, serverValue: boolean) {
  const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }
  return () =>
    useSyncExternalStore(
      subscribe,
      () => window.matchMedia(query).matches,
      () => serverValue
    )
}

/** Server snapshot says "reduce" so nothing animates until the client has actually checked. */
const useOsReducedMotion = mediaStore("(prefers-reduced-motion: reduce)", true)

/** The OS setting, or the site-level "Reduce motion" preference. */
export function usePrefersReducedMotion() {
  const os = useOsReducedMotion()
  return usePreferences().reduceMotion || os
}
export const useFinePointer = mediaStore(
  "(hover: hover) and (pointer: fine)",
  false
)

/** Shared IntersectionObservers keyed by options, instead of one per cover. */
const observers = new Map<
  string,
  {
    io: IntersectionObserver
    callbacks: Map<Element, (entry: IntersectionObserverEntry) => void>
  }
>()

export function observeIntersection(
  element: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  {
    rootMargin = "0px",
    threshold = 0,
  }: { rootMargin?: string; threshold?: number } = {}
): () => void {
  const key = `${rootMargin}|${threshold}`
  let entry = observers.get(key)
  if (!entry) {
    const callbacks = new Map<
      Element,
      (entry: IntersectionObserverEntry) => void
    >()
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => callbacks.get(e.target)?.(e)),
      { rootMargin, threshold }
    )
    entry = { io, callbacks }
    observers.set(key, entry)
  }
  entry.callbacks.set(element, callback)
  entry.io.observe(element)
  const current = entry
  return () => {
    current.callbacks.delete(element)
    current.io.unobserve(element)
  }
}
