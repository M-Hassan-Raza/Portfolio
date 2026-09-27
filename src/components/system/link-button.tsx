import { createLink } from "@tanstack/react-router"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonAnchorProps = ComponentProps<"a"> &
  VariantProps<typeof buttonVariants>

function ButtonAnchor({
  className,
  variant,
  size,
  ...props
}: ButtonAnchorProps) {
  return (
    <a
      data-slot="link-button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

/** A router link that looks like a button. Stays a real <a> for semantics. */
export const LinkButton = createLink(ButtonAnchor)

/** The same look for external URLs and mailto links. */
export function AnchorButton(props: ButtonAnchorProps) {
  return <ButtonAnchor {...props} />
}
