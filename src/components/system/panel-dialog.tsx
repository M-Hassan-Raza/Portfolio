import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/** A paper panel with the sticker edge, centred over the page. */
export function PanelDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  titleClassName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
  className?: string
  titleClassName?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto rounded-[24px] border-2 border-ink bg-paper-raised p-6 text-ink shadow-rest ring-0 sm:max-w-2xl sm:p-8",
          className
        )}
      >
        <DialogHeader className="gap-2 pr-8">
          <DialogTitle className={cn("type-h3 text-[1.75rem]", titleClassName)}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-[0.9375rem] text-ink-soft">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
