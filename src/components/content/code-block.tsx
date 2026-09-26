import { useRef, useState } from "react"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"

export function CodeBlock(props: ComponentProps<"pre">) {
  const ref = useRef<HTMLPreElement>(null)
  const [status, setStatus] = useState("")
  async function copy() {
    if (!ref.current) return
    try {
      await navigator.clipboard.writeText(ref.current.innerText)
      setStatus("Copied")
    } catch {
      setStatus("Could not copy. Select the code and copy it manually.")
    }
  }
  return (
    <div className="not-prose space-y-2">
      <div className="flex items-center justify-end gap-3">
        <span role="status" className="text-sm">
          {status}
        </span>
        <Button variant="outline" size="sm" onClick={copy}>
          Copy code
        </Button>
      </div>
      <pre
        {...props}
        ref={ref}
        className="overflow-x-auto rounded-md border border-border p-4"
      />
    </div>
  )
}
