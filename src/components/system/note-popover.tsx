import type { ComponentProps, ReactNode } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/*
 * Studio wrappers over the Base UI primitives live one per module
 * (note-popover, menu-sheet, panel-dialog, keys), so a page only loads the
 * primitives it uses. Pages import these, never ui/.
 */

/** A raised paper note that pops out of its trigger (book spines, footnotes). */
export function NotePopover({
  trigger,
  children,
  side = "top",
  openOnHover = true,
  className,
}: {
  trigger: ComponentProps<typeof PopoverTrigger>["render"]
  children: ReactNode
  side?: "top" | "bottom" | "left" | "right"
  openOnHover?: boolean
  className?: string
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={trigger}
        openOnHover={openOnHover}
        delay={80}
        closeDelay={120}
      />
      <PopoverContent
        side={side}
        sideOffset={14}
        className={cn(
          "w-72 gap-3 rounded-lg border-2 border-ink bg-paper-raised p-5 text-ink shadow-rest ring-0",
          className
        )}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}
