import { RotateCw } from "lucide-react"
import { useState } from "react"
import type { ReactNode } from "react"
import type { Hue } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { Shape } from "./shape"
import type { ShapeName } from "./shape"

/**
 * Front: a pastel face with a big shape and a short title.
 * Back: paper with a few sentences. A real button flips it.
 */
export function FlipCard({
  title,
  children,
  hue,
  shape,
}: {
  title: string
  children: ReactNode
  hue: Hue
  shape: ShapeName
}) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div data-hue={hue} className="flip-scene relative h-[22rem]">
      <div
        data-flipped={flipped ? "" : undefined}
        className="flip-inner relative size-full"
      >
        <div
          aria-hidden={flipped}
          className="flip-face absolute inset-0 flex flex-col justify-between overflow-hidden rounded-lg bg-hue p-7 text-on-pastel"
        >
          <Shape
            name={shape}
            className="absolute -top-6 -right-8 size-52 text-hue-tint"
          />
          <span />
          <h3 className="relative max-w-[11ch] pr-10 type-h3 text-[1.65rem] leading-[1.05]">
            {title}
          </h3>
        </div>
        <div
          aria-hidden={!flipped}
          className="flip-face flip-back absolute inset-0 flex flex-col gap-4 rounded-lg border-[1.5px] border-ink bg-paper-raised p-7 text-ink"
        >
          <p className="type-label text-hue-deep">{title}</p>
          <p className="type-lede text-[1.2rem]">{children}</p>
        </div>
      </div>
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={flipped ? `Show ${title}` : `Read more about ${title}`}
        onClick={() => setFlipped((value) => !value)}
        className={cn(
          "pressable absolute right-5 bottom-5 grid size-10 cursor-pointer place-items-center rounded-full border-[1.5px] border-ink bg-paper-raised text-ink"
        )}
      >
        <RotateCw
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-500 ease-(--ease-settle)",
            flipped && "rotate-180"
          )}
          strokeWidth={2.4}
        />
      </button>
    </div>
  )
}
