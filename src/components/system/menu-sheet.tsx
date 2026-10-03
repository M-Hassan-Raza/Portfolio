import type { ComponentProps, ReactNode } from "react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"

/**
 * The full-height menu sheet that drops from the top on small screens.
 * Controlled; the opener lives outside it so the sheet can load lazily.
 */
export function MenuSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
