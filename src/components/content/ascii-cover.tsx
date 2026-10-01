import { AsciiArt } from "@/components/ascii/ascii-art"
import type { AsciiEffects } from "@/components/ascii/ascii-art"

export function AsciiCover({
  asset,
  alt,
  variant = "landscape",
  effects,
}: {
  asset: string
  alt: string
  variant?: "landscape" | "portrait" | "screen"
  effects?: AsciiEffects
}) {
  return (
    <AsciiArt
      asset={asset}
      alt={alt}
      className={`ascii-cover-${variant}`}
      effects={effects}
    />
  )
}

export function Screen({ asset, caption }: { asset: string; caption: string }) {
  return (
    <figure>
      <AsciiCover asset={asset} alt={caption} variant="screen" />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
