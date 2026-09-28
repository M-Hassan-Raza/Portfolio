import type { CSSProperties, ReactNode } from "react"
import { profile } from "#content"
import { AsciiCover } from "@/components/content/ascii-cover"
import { cn } from "@/lib/utils"

/**
 * The headshot, printed small. Every treatment is either a photo or a set of
 * pre-processed alpha plates inked with theme tokens, so no colour lives in
 * an image. The lab at /lab/portrait/ shows them side by side.
 */
export const portraitTreatments = [
  {
    id: "A",
    key: "polaroid",
    name: "Polaroid",
    note: "Natural colour on a paper mount.",
  },
  {
    id: "B",
    key: "warm-bw",
    name: "Warm print",
    note: "Black and white, multiplied onto cream, with grain.",
  },
  {
    id: "C",
    key: "riso",
    name: "Riso",
    note: "Two inks, two screens, slightly off register.",
  },
  {
    id: "D",
    key: "newsprint",
    name: "Newsprint",
    note: "One ink, a 45 degree dot screen.",
  },
  {
    id: "E",
    key: "photocopy",
    name: "Photocopy",
    note: "Hard threshold, toner speckle.",
  },
  {
    id: "F",
    key: "diecut",
    name: "Die-cut",
    note: "Cut out, thick paper edge, hard shadow.",
  },
  {
    id: "G",
    key: "cutout",
    name: "Cut-out",
    note: "Colour photo on the section's block.",
  },
  {
    id: "H",
    key: "ascii",
    name: "ASCII",
    note: "The existing ASCII portrait, in ink.",
  },
  {
    id: "I",
    key: "screenprint",
    name: "Screenprint",
    note: "Three flat tones: ink, block, paper.",
  },
  {
    id: "J",
    key: "engrave",
    name: "Engraving",
    note: "Line weight follows the tone.",
  },
] as const

export type PortraitTreatment = (typeof portraitTreatments)[number]["key"]

/** The treatment the live pages use. */
export const chosenPortrait: PortraitTreatment = "diecut"

const alt = `Portrait of ${profile.name}`

function Plate({
  src,
  className,
  style,
}: {
  src: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("portrait-plate", className)}
      style={{ "--plate-src": `url(${src})`, ...style } as CSSProperties}
    />
  )
}

function Frame({
  children,
  className,
  label = true,
}: {
  children: ReactNode
  className?: string
  label?: boolean
}) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label ? alt : undefined}
      className={cn(
        "portrait aspect-[4/5] w-full overflow-clip rounded-lg border-2 border-ink bg-paper-fixed shadow-rest",
        className
      )}
    >
      {children}
    </span>
  )
}

function Treatment({ treatment }: { treatment: PortraitTreatment }) {
  switch (treatment) {
    case "polaroid":
      return (
        <span className="flex flex-col gap-2 rounded-lg border-2 border-ink bg-paper-fixed p-2 pb-7 shadow-rest">
          <span className="portrait aspect-[4/5] w-full overflow-clip rounded-sm">
            <img
              src="/assets/portrait/natural.jpg"
              alt={alt}
              width={480}
              height={600}
            />
          </span>
        </span>
      )
    case "warm-bw":
      return (
        <Frame className="portrait-grain" label={false}>
          <img
            src="/assets/portrait/mono.jpg"
            alt={alt}
            width={480}
            height={600}
            className="mix-blend-multiply"
          />
        </Frame>
      )
    case "riso":
      return (
        <Frame className="isolate">
          <Plate
            src="/assets/portrait/riso-warm.png"
            className="mix-blend-multiply"
            style={
              {
                "--plate": "var(--pink)",
                translate: "1.5px 1px",
              } as CSSProperties
            }
          />
          <Plate
            src="/assets/portrait/riso-ink.png"
            className="mix-blend-multiply"
            style={{ "--plate": "var(--ink-fixed)" } as CSSProperties}
          />
        </Frame>
      )
    case "newsprint":
      return (
        <Frame>
          <Plate
            src="/assets/portrait/halftone.png"
            style={{ "--plate": "var(--ink-fixed)" } as CSSProperties}
          />
        </Frame>
      )
    case "photocopy":
      return (
        <Frame className="portrait-grain bg-paper-fixed-sunk">
          <Plate
            src="/assets/portrait/threshold.png"
            style={{ "--plate": "var(--ink-fixed)" } as CSSProperties}
          />
        </Frame>
      )
    case "diecut":
      return (
        <span
          role="img"
          aria-label={alt}
          className="portrait aspect-[4/5] w-full drop-shadow-[4px_4px_0_var(--sticker-shade)]"
        >
          <Plate
            src="/assets/portrait/sticker-edge.png"
            style={{ "--plate": "var(--paper-fixed-raised)" } as CSSProperties}
          />
          <img
            src="/assets/portrait/sticker.webp"
            alt=""
            width={480}
            height={600}
            className="absolute inset-0"
          />
        </span>
      )
    case "cutout":
      return (
        <Frame className="bg-block" label={false}>
          <img
            src="/assets/portrait/cutout.webp"
            alt={alt}
            width={480}
            height={600}
          />
        </Frame>
      )
    case "ascii":
      return (
        <Frame className="bg-ink-fixed" label={false}>
          <span className="-ml-[12.5%] block w-[125%] [--ascii-wght:620] [&_.ascii-frame]:w-full [&_.ascii-frame]:bg-ink-fixed [&_.ascii-frame]:text-paper-fixed">
            <AsciiCover asset="profile-140" alt={alt} variant="portrait" />
          </span>
        </Frame>
      )
    case "screenprint":
      return (
        <Frame>
          <Plate
            src="/assets/portrait/poster-mid.png"
            style={{ "--plate": "var(--block)" } as CSSProperties}
          />
          <Plate
            src="/assets/portrait/poster-dark.png"
            style={{ "--plate": "var(--ink-fixed)" } as CSSProperties}
          />
        </Frame>
      )
    case "engrave":
      return (
        <Frame>
          <Plate
            src="/assets/portrait/engrave.png"
            style={{ "--plate": "var(--ink-fixed)" } as CSSProperties}
          />
        </Frame>
      )
  }
}

/**
 * A small tilted portrait. It lives near the name on home and on About,
 * never larger than a sticker.
 */
export function Portrait({
  treatment = chosenPortrait,
  tilt = -3,
  className,
}: {
  treatment?: PortraitTreatment
  tilt?: number
  className?: string
}) {
  return (
    <span
      className={cn("block shrink-0", className)}
      style={{ rotate: `${tilt}deg` }}
    >
      <Treatment treatment={treatment} />
    </span>
  )
}
