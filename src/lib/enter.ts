import { useEffect, useRef } from "react"

declare global {
  interface Window {
    /** The entrance observer, created by enterBootScript (src/lib/boot.ts). */
    __enter?: IntersectionObserver
  }
}

/**
 * Props that make an element play its CSS entrance when it scrolls into view.
 * Prerendered elements are already watched by the boot script; this covers
 * elements React renders later (client-side navigation). `data-entered` is set
 * outside React, hence suppressHydrationWarning.
 */
export function useEnter<T extends Element>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const element = ref.current
    const observer = window.__enter
    if (!element || !observer || element.hasAttribute("data-entered")) return
    observer.observe(element)
    return () => observer.unobserve(element)
  }, [])
  return {
    ref,
    "data-enter-on": "",
    suppressHydrationWarning: true,
  } as const
}
