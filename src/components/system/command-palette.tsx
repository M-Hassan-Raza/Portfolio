import {
  Suspense,
  createContext,
  lazy,
  use,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"
import { prefetchWhenIdle } from "@/lib/prefetch"
import { QuirksProvider } from "./quirks"

export type PaletteState = { open: boolean; setOpen: (open: boolean) => void }
const PaletteContext = createContext<PaletteState | null>(null)

export function useCommandPalette() {
  const value = use(PaletteContext)
  if (!value) throw new Error("useCommandPalette needs CommandPaletteProvider")
  return value
}

/*
 * The dialog, cmdk, Fuse and the full-text index are one chunk. It loads on
 * the first open, or earlier on a hint: idle time on a fast connection, a
 * pointer or focus on a search button, or a held ⌘/Ctrl on the way to ⌘K.
 */
const importPalette = () => import("./command-palette-dialog")
let loading: ReturnType<typeof importPalette> | undefined
const loadPalette = () => (loading ??= importPalette())
const CommandPalette = lazy(loadPalette)

export function preloadCommandPalette() {
  void loadPalette().catch(() => {
    loading = undefined
  })
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  // Mounted on first open and kept, so closing still animates.
  const [mounted, setMounted] = useState(false)
  if (open && !mounted) setMounted(true)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      // A scene (terminal, vim, rain) owns the keyboard while it's up.
      if (document.documentElement.dataset.scene) return
      if (event.key === "Meta" || event.key === "Control")
        preloadCommandPalette()
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKey)
    prefetchWhenIdle(loadPalette, { keyboard: true })
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const value = useMemo(() => ({ open, setOpen }), [open])
  return (
    <PaletteContext value={value}>
      <QuirksProvider>
        {children}
        {mounted && (
          <Suspense fallback={null}>
            <CommandPalette open={open} setOpen={setOpen} />
          </Suspense>
        )}
      </QuirksProvider>
    </PaletteContext>
  )
}
