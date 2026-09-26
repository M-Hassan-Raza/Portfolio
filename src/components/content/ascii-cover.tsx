import { lazy, Suspense } from "react"

const sources = import.meta.glob<string>("../../../assets/ascii-covers/*.txt", {
  query: "?raw",
  import: "default",
})
const covers = new Map(
  Object.entries(sources).map(([path, load]) => [
    path
      .split("/")
      .at(-1)
      ?.replace(/\.txt$/, ""),
    lazy(async () => {
      const text = await load()
      const columns = Math.max(...text.split("\n").map((line) => line.length))
      return {
        default: () => (
          <pre
            aria-hidden="true"
            className="ascii-art"
            style={{ fontSize: `${100 / (columns * 0.6)}cqw` }}
          >
            {text}
          </pre>
        ),
      }
    }),
  ])
)

export function AsciiCover({
  asset,
  alt,
  variant = "landscape",
}: {
  asset: string
  alt: string
  variant?: "landscape" | "portrait" | "screen"
}) {
  const Art = covers.get(asset)
  if (!Art) throw new Error(`Missing ASCII cover: ${asset}`)
  return (
    <div className={`ascii-cover ascii-cover-${variant}`}>
      <Suspense fallback={<div aria-hidden="true" className="min-h-40" />}>
        <Art />
      </Suspense>
      <span className="sr-only">{alt}</span>
    </div>
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
