import { Check, Copy } from "lucide-react"
import { useState } from "react"
import type { CSSProperties } from "react"
import { useCopy } from "@/components/system/copy"
import { hues } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { Shape, shapeNames } from "./shape"

const bits = Array.from({ length: 6 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2
  return {
    x: Math.cos(angle) * 46,
    y: Math.sin(angle) * 46,
    r: index % 2 === 0 ? 120 : -90,
    shape: shapeNames[(index * 3) % shapeNames.length] ?? "circle",
    hue: hues[index % hues.length] ?? "peach",
  }
})

/** The email set large, with a copy button that bursts six tiny shapes. */
export function CopyEmail({
  email,
  className,
}: {
  email: string
  className?: string
}) {
  const { copied, copy } = useCopy()
  const [burst, setBurst] = useState(0)
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <a
        href={`mailto:${email}`}
        className="type-annotation text-[clamp(1.9rem,4vw+0.5rem,3.5rem)] leading-none tracking-[-0.02em] text-ink underline decoration-hue-deep decoration-2 underline-offset-[0.18em] hover:decoration-pop"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={() => {
          void copy(email, "Email copied")
          setBurst((count) => count + 1)
        }}
        className="pressable relative grid size-12 cursor-pointer place-items-center rounded-full border-[1.5px] border-ink bg-paper-raised text-ink"
        aria-label={copied ? "Email copied" : "Copy email address"}
      >
        {copied ? (
          <Check aria-hidden="true" className="size-5" strokeWidth={2.6} />
        ) : (
          <Copy aria-hidden="true" className="size-5" strokeWidth={2.2} />
        )}
        {burst > 0 && (
          <span
            key={burst}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            {bits.map((bit) => (
              <span
                key={`${bit.x}-${bit.y}`}
                data-hue={bit.hue}
                className="burst-bit absolute top-1/2 left-1/2 size-3 text-hue"
                style={
                  {
                    "--burst-x": `${bit.x}px`,
                    "--burst-y": `${bit.y}px`,
                    "--burst-r": `${bit.r}deg`,
                  } as CSSProperties
                }
              >
                <Shape name={bit.shape} className="size-full" />
              </span>
            ))}
          </span>
        )}
      </button>
    </div>
  )
}
