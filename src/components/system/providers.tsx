import { MotionConfig } from "motion/react"
import type { ReactNode } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toast"
import { CommandPaletteProvider } from "./command-palette"

/** Client-side providers mounted once in the root document. */
export function SiteProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delay={350}>
        <Toaster>
          <CommandPaletteProvider>{children}</CommandPaletteProvider>
        </Toaster>
      </TooltipProvider>
    </MotionConfig>
  )
}
