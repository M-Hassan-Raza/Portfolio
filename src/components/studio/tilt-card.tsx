import { createLink } from "@tanstack/react-router"
import type { CSSProperties, ComponentProps } from "react"
import { tiltAt } from "@/lib/studio"
import type { Surface } from "@/lib/studio"
import { cn } from "@/lib/utils"

type TiltAnchorProps = ComponentProps<"a"> & {
  /** Position in the fixed tilt sequence. */
  tiltIndex?: number
  /** Explicit tilt in degrees; overrides the sequence. */
  tilt?: number
  /** The piece's own colour, used when the card is touched. */
  block?: Surface
}

function TiltAnchor({
  tiltIndex = 0,
  tilt,
  block,
  className,
  style,
  ...props
}: TiltAnchorProps) {
  return (
    <a
      data-block={block}
      className={cn("tilt-card group block cursor-pointer", className)}
      style={
        {
          "--tilt": `${tilt ?? tiltAt(tiltIndex)}deg`,
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  )
}

/**
 * A card pinned slightly crooked to the wall. Rest: tilted, 2px ink outline,
 * hard 4px shadow. Hover or focus: straightens and lifts. Press: clicks in.
 * The whole card is the link.
 */
export const TiltCardLink = createLink(TiltAnchor)

export function TiltCardAnchor(props: TiltAnchorProps) {
  return <TiltAnchor {...props} />
}

/** The same card, for things that are not links (values, offers). */
export function TiltCard({
  tiltIndex = 0,
  tilt,
  block,
  className,
  style,
  ...props
}: ComponentProps<"div"> & {
  tiltIndex?: number
  tilt?: number
  block?: Surface
}) {
  return (
    <div
      data-block={block}
      className={cn("tilt-card group", className)}
      style={
        {
          "--tilt": `${tilt ?? tiltAt(tiltIndex)}deg`,
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  )
}
