import { useEffect } from "react"
import { Toaster, toast } from "@/components/ui/toast"

type Note = Parameters<typeof toast.add>[0]

/**
 * The toast viewport, loaded by notify.tsx on first use. `onReady` fires from
 * this component's effect, which runs after the provider inside Toaster has
 * subscribed to the manager, so no note is dropped.
 */
export default function Notifications({
  onReady,
}: {
  onReady: (send: (note: Note) => void) => void
}) {
  useEffect(() => onReady((note) => void toast.add(note)), [onReady])
  return <Toaster />
}
