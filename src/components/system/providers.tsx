import type { ReactNode } from "react"
import { CommandPaletteProvider } from "./command-palette"
import { Notifications } from "./notify"

/** Client-side providers mounted once in the root document. */
export function SiteProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <CommandPaletteProvider>{children}</CommandPaletteProvider>
      <Notifications />
    </>
  )
}
