import { cn } from "@/lib/utils"

/**
 * A section divider that lets two bands flow into each other with no hard
 * line. Fill it with the NEXT (or previous) band's colour via a text-* class.
 */
export function WavyEdge({
  variant = "wave",
  className,
  flip = false,
}: {
  variant?: "wave" | "curve"
  className?: string
  /** Mirror vertically, for a band's bottom edge. */
  flip?: boolean
}) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "pointer-events-none block h-10 w-full sm:h-16",
        flip && "-scale-y-100",
        className
      )}
      fill="currentColor"
    >
      {variant === "wave" ? (
        <path d="M0 44 C120 20 240 12 360 28 C480 44 600 66 720 58 C840 50 960 16 1080 14 C1200 12 1320 36 1440 40 V80 H0 Z" />
      ) : (
        <path d="M0 0 C360 78 1080 78 1440 0 V80 H0 Z" />
      )}
    </svg>
  )
}
