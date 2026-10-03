import { useTheme } from "next-themes"
import { useHydrated } from "@tanstack/react-router"
import { Moon, Sun } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { prefersStillness } from "@/lib/preferences"
import { cn } from "@/lib/utils"
import { useQuirks } from "./quirks"

/** How long the "Can't decide?" note stays up. */
const dizzyMs = 2800

/**
 * Sun turns into moon with a half-turn (keyframes in styles.css, since
 * next-themes switches transitions off while the theme changes). Flip it
 * enough times and it gets dizzy.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const dark = hydrated && resolvedTheme === "dark"
  const { unlock } = useQuirks()
  const button = useRef<HTMLButtonElement>(null)
  const flips = useRef<number[]>([])
  const [note, setNote] = useState<"shown" | "leaving" | null>(null)
  // Icons only animate once the visitor has flipped, never on load.
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (note !== "shown") return
    const timer = setTimeout(() => setNote("leaving"), dizzyMs)
    return () => clearTimeout(timer)
  }, [note])

  const flip = () => {
    setFlipped(true)
    setTheme(dark ? "light" : "dark")
    const now = Date.now()
    flips.current = [...flips.current.filter((at) => now - at < 4000), now]
    if (flips.current.length >= 6) {
      flips.current = []
      setNote("shown")
      unlock("indecisive")
      if (!prefersStillness())
        button.current?.animate(
          [
            { rotate: "0deg" },
            { rotate: "-25deg", offset: 0.2 },
            { rotate: "720deg" },
          ],
          { duration: 1100, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        )
    }
  }

  return (
    <span className="relative flex">
      <button
        ref={button}
        type="button"
        aria-label="Toggle dark mode"
        aria-pressed={dark}
        onClick={flip}
        data-dark={dark ? "" : undefined}
        data-flipped={flipped ? "" : undefined}
        className={cn(
          "theme-toggle pressable-flat relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full border-[1.5px] border-ink text-ink hover:bg-paper-sunk",
          className
        )}
      >
        <span className="theme-toggle-sun absolute grid place-items-center">
          <Sun
            aria-hidden="true"
            className="size-[1.05rem]"
            strokeWidth={2.2}
          />
        </span>
        <span className="theme-toggle-moon absolute grid place-items-center">
          <Moon
            aria-hidden="true"
            className="size-[1.05rem]"
            strokeWidth={2.2}
          />
        </span>
      </button>
      {note && (
        <span
          role="status"
          data-leaving={note === "leaving" ? "" : undefined}
          onAnimationEnd={() => {
            if (note === "leaving") setNote(null)
          }}
          className="dizzy-note absolute top-full right-0 mt-4 flex w-max flex-col rounded-[14px] border-2 border-ink bg-paper-raised px-4 py-2.5 text-sm text-ink shadow-small"
        >
          <span
            aria-hidden="true"
            className="absolute -top-[9px] right-3 size-4 rotate-45 border-t-2 border-l-2 border-ink bg-paper-raised"
          />
          <span className="font-extrabold">Can't decide? Same.</span>
          <span className="text-ink-soft">
            Type <span className="font-mono">theme system</span> in the
            terminal.
          </span>
        </span>
      )}
    </span>
  )
}
