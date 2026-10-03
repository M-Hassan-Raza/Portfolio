type Connection = { saveData?: boolean; effectiveType?: string }

/** False on Save-Data and 2G/3G connections, where every byte is the visitor's. */
export function canPrefetch() {
  const connection = (navigator as Navigator & { connection?: Connection })
    .connection
  if (!connection) return true
  return !connection.saveData && !/2g|3g/.test(connection.effectiveType ?? "")
}

/**
 * Warms a lazy chunk once the browser is idle, so a feature opens instantly
 * the first time it's used. Skipped where prefetching would cost the visitor:
 * slow or metered connections, weak machines for heavy chunks, and touch
 * screens for features you reach from a keyboard (⌘K, the backtick).
 */
export function prefetchWhenIdle(
  load: () => Promise<unknown>,
  {
    heavy = false,
    keyboard = false,
  }: { heavy?: boolean; keyboard?: boolean } = {}
) {
  if (!canPrefetch()) return
  if (heavy && document.documentElement.dataset.perf === "low") return
  if (keyboard && !window.matchMedia("(pointer: fine)").matches) return
  const run = () => void load().catch(() => undefined)
  if ("requestIdleCallback" in window)
    requestIdleCallback(run, { timeout: 5000 })
  else setTimeout(run, 3000)
}
