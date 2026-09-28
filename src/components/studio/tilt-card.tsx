import { createLink } from "@tanstack/react-router"
import type { CSSProperties, ComponentProps } from "react"
import { tiltAt } from "@/lib/studio"
import type { Hue } from "@/lib/studio"
import { cn } from "@/lib/utils"

type TiltAnchorProps = ComponentProps<"a"> & {
  /** Position in the fixed tilt sequence. */
  tiltIndex?: number
  /** Explicit tilt in degrees; overrides the sequence. */
  tilt?: number
  hue?: Hue
}

function TiltAnchor({
  tiltIndex = 0,
  tilt,
  hue,
  className,
  style,
  ...props
}: TiltAnchorProps) {
  return (
    <a
      data-hue={hue}
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
 * A sticker card pinned slightly crooked to the wall. Rest: tilted, 1.5px ink
 * outline, hard 4px shadow. Hover or focus: straightens and lifts. Press: clicks.
 * The whole card is the link.
 */
export const TiltCardLink = createLink(TiltAnchor)

export function TiltCardAnchor(props: TiltAnchorProps) {
  return <TiltAnchor {...props} />
}
