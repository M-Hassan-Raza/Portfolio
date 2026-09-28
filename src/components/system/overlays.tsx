import type { ComponentProps, ReactNode } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

/**
 * Studio wrappers over the Base UI primitives. Pages import these, never ui/.
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

/** The full-height menu sheet that drops from the top on small screens. */
export function MenuSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ComponentProps<typeof SheetTrigger>["render"]
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger render={trigger} />
      <SheetContent
        side="top"
        showCloseButton={false}
        className="max-h-dvh gap-0 overflow-y-auto border-0 border-b-2 border-ink bg-paper text-ink"
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <SheetDescription className="sr-only">{description}</SheetDescription>
        {children}
      </SheetContent>
    </Sheet>
  )
}

export function MenuSheetClose(props: ComponentProps<typeof SheetClose>) {
  return <SheetClose {...props} />
}
