import { manifest } from "virtual:ascii-manifest"
import { AsciiCover } from "@/components/content/ascii-cover"
import { hashOf } from "@/lib/studio"
import type { Hue } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { Face, Shape, shapeNames } from "./shape"

/**
 * Every cover sits in a frame: a pastel mat, 12px inset, 18px inner radius,
 * 1.5px ink border. ASCII art is blended into the mat so it joins the palette.
 * Entries without a cover get a little composition from the shape vocabulary.
 */
export function CoverMat({
  asset,
  alt,
  seed,
  hue,
  className,
  frameClassName,
  aspect = "aspect-[16/10]",
  transitionName,
}: {
  asset?: string
  alt: string
  seed: string
  hue: Hue
  className?: string
  frameClassName?: string
  aspect?: string
  transitionName?: string
}) {
  return (
    <div
      data-hue={hue}
      className={cn("rounded-[1.5rem] bg-hue p-3", className)}
    >
      <div
        className={cn(
          "ascii-tinted relative grid place-items-center overflow-hidden rounded-[1.125rem] border-[1.5px] border-ink bg-hue-tint",
          aspect,
          frameClassName
        )}
        style={
          transitionName ? { viewTransitionName: transitionName } : undefined
        }
      >
        {asset ? (
          <div className="w-full [&_.ascii-frame]:w-full">
            <AsciiCover
              asset={manifest[`${asset}-140`] ? `${asset}-140` : asset}
              alt={alt}
            />
          </div>
        ) : (
          <ShapeComposition seed={seed} label={alt} />
        )}
      </div>
    </div>
  )
}

/** Three shapes stacked like cut card, chosen from the seed. */
function ShapeComposition({ seed, label }: { seed: string; label: string }) {
  const hash = hashOf(seed)
  const pick = (offset: number) =>
    shapeNames[(hash >>> offset) % shapeNames.length] ?? "circle"
  return (
    <div role="img" aria-label={label} className="relative size-full">
      <Shape
        name={pick(2)}
        className="absolute -bottom-[18%] -left-[8%] w-[46%] text-hue"
        style={{ rotate: `${(hash % 30) - 15}deg` }}
      />
      <Shape
        name={pick(7)}
        className="absolute top-[10%] right-[12%] w-[30%] text-paper-raised"
        style={{ rotate: `${(hash % 20) - 10}deg` }}
      />
      <span className="absolute top-[34%] left-[34%] block w-[30%]">
        <Shape name={pick(11)} className="w-full text-ink" />
        <Face
          mood="happy"
          className="absolute top-[38%] left-1/2 w-[48%] -translate-x-1/2 text-paper-raised"
        />
      </span>
    </div>
  )
}
