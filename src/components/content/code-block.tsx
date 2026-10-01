import { Check, Copy } from "lucide-react"
import { useRef, useState } from "react"
import type { ComponentProps } from "react"
import { PillButton } from "@/components/studio/pill"

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
    <div className="not-prose relative flex flex-col rounded-lg border-2 border-ink bg-code-surface">
      <div className="flex items-center justify-end gap-3 px-2 pt-2">
        <span role="status" className="text-sm font-medium text-ink-soft">
          {status}
        </span>
        <PillButton
          variant="paper"
          size="sm"
          onClick={copy}
          className="h-8 px-3 text-xs"
        >
          {status === "Copied" ? (
            <Check aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          Copy code
        </PillButton>
      </div>
      <pre
        {...props}
        ref={ref}
        className="overflow-x-auto px-5 pt-2 pb-5 font-mono text-[0.8125rem] leading-[1.7]"
      />
    </div>
  )
}
