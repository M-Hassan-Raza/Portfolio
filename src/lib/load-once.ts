/**
 * Memoises a chunk load. Once it settles, the promise carries React's
 * thenable fields (status, value), so `use(promise)` reads it synchronously
 * instead of suspending: a route loader (or the client entry, before
 * hydration) awaits the load, and rendering then never waits on it.
 * A failed load is forgotten, so the next attempt fetches again.
 */
export function loadOnce<T>(load: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined
  return () => {
    if (promise) return promise
    const current = load()
    promise = current
    current.then(
      (value) => Object.assign(current, { status: "fulfilled", value }),
      (reason: unknown) => {
        Object.assign(current, { status: "rejected", reason })
        if (promise === current) promise = undefined
      }
    )
    return current
  }
}

/** An already-settled promise, for data that ships with the app. */
export function settled<T>(value: T): Promise<T> {
  return Object.assign(Promise.resolve(value), { status: "fulfilled", value })
}
