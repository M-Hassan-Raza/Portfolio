import { useCallback, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { notify } from "./notify"

/** Copies text, reports through a toast, and exposes a short-lived "copied" flag. */
export function useCopy(resetMs = 1600) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = useCallback(
    async (text: string, label = "Copied") => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), resetMs)
        notify({ title: label, description: text })
      } catch {
        notify({
          title: "Could not copy",
          description: `Select it instead: ${text}`,
          type: "error",
        })
      }
    },
    [resetMs]
  )
  return { copied, copy }
}

/** Render prop keeps each direction free to style the trigger. */
export function CopyText({
  text,
  label,
  children,
}: {
  text: string
  label?: string
  children: (state: { copied: boolean; copy: () => void }) => ReactNode
}) {
  const { copied, copy } = useCopy()
  return children({ copied, copy: () => void copy(text, label) })
}
