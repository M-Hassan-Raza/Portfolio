import { createLink } from "@tanstack/react-router"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

/**
 * Pills are the only buttons. Primary is an ink pill; secondary is raised
 * paper with an ink outline. A pastel is never the colour of a button.
 */
export const pillVariants = cva(
  "pressable inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        ink: "bg-ink text-paper hover:bg-ink-hover",
        paper:
          "border-[1.5px] border-ink bg-paper-raised text-ink hover:bg-paper-hover",
        ghost: "text-ink hover:bg-paper-sunk",
        soft: "bg-paper-raised text-ink shadow-soft hover:bg-paper-hover",
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-5 text-[0.9375rem] [&_svg]:size-4",
        lg: "h-14 px-7 text-base [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-[1.1rem]",
      },
    },
    defaultVariants: { variant: "ink", size: "md" },
  }
)

type PillAnchorProps = ComponentProps<"a"> & VariantProps<typeof pillVariants>

function PillAnchorBase({
  className,
  variant,
  size,
  ...props
}: PillAnchorProps) {
  return (
    <a
      data-slot="pill"
      className={cn(pillVariants({ variant, size }), className)}
      {...props}
    />
  )
}

/** A router link shaped like a pill. Stays a real <a>. */
export const PillLink = createLink(PillAnchorBase)

/** The same pill for external URLs, mailto and downloads. */
export function PillAnchor(props: PillAnchorProps) {
  return <PillAnchorBase {...props} />
}

export function PillButton({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ComponentProps<"button"> & VariantProps<typeof pillVariants>) {
  return (
    <button
      type={type}
      data-slot="pill"
      className={cn(pillVariants({ variant, size }), className)}
      {...props}
    />
  )
}
