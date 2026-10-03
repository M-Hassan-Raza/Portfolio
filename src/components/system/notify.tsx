import { Suspense, lazy, useEffect, useSyncExternalStore } from "react"
import type { toast } from "@/components/ui/toast"
import { prefetchWhenIdle } from "@/lib/prefetch"

type Note = Parameters<typeof toast.add>[0]

/*
 * Toasts only follow an action (a copy), so the toast UI is a chunk of its
 * own, mounted the first time something is announced. Notes sent while it
 * loads wait in a queue.
 */
const loadToaster = () => import("./notifications")
const Toaster = lazy(loadToaster)

const queue: Note[] = []
let deliver: ((note: Note) => void) | undefined
let requested = false
const listeners = new Set<() => void>()

export function notify(note: Note) {
  if (deliver) return void deliver(note)
  queue.push(note)
  if (requested) return
  requested = true
  for (const listener of listeners) listener()
}

function ready(send: (note: Note) => void) {
  deliver = send
  for (const note of queue.splice(0)) send(note)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function Notifications() {
  const show = useSyncExternalStore(
    subscribe,
    () => requested,
    () => false
  )
  useEffect(() => prefetchWhenIdle(loadToaster), [])
  if (!show) return null
  return (
    <Suspense fallback={null}>
      <Toaster onReady={ready} />
    </Suspense>
  )
}
