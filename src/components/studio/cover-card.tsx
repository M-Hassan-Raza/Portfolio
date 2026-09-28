import { manifest } from "virtual:ascii-manifest"
import { AsciiCover } from "@/components/content/ascii-cover"
import type { Surface } from "@/lib/studio"
import { cn } from "@/lib/utils"

/** Prefers the half-density variant, which stays legible at card size. */
export function coverAsset(asset: string, dense = false) {
  return !dense && manifest[`${asset}-140`] ? `${asset}-140` : asset
}

/**
 * An ASCII cover in a rounded ink frame. `print` is ink on paper and floods
 * with the piece's colour when its card is touched; `block` always wears the
 * colour; `deep` prints the other way round, for covers sitting on their
 * own block.
 */
export function CoverFrame({
  asset,
  alt,
  block,
  tone = "print",
  className,
  aspect = "aspect-[16/10]",
  transitionName,
  dense = false,
}: {
  asset?: string
  alt: string
  block?: Surface
  tone?: "print" | "block" | "deep"
  className?: string
  aspect?: string
  transitionName?: string
  dense?: boolean
}) {
  return (
    <div
      data-block={block}
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-lg border-2 border-ink",
        tone === "print" && "cover-print bg-paper-sunk",
        tone === "block" && "cover-print-block bg-block",
        tone === "deep" && "cover-print-deep bg-block-deep",
        aspect,
        className
      )}
      style={
        transitionName ? { viewTransitionName: transitionName } : undefined
      }
    >
      {asset ? (
        <div className="w-full [&_.ascii-frame]:w-full">
          <AsciiCover asset={coverAsset(asset, dense)} alt={alt} />
        </div>
      ) : (
        <span
          role="img"
          aria-label={alt}
          className="px-6 text-center type-h2 text-[clamp(2rem,4vw,3.5rem)] text-ink"
        >
          {alt}
        </span>
      )}
    </div>
  )
}
