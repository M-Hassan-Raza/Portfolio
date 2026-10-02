import { useTheme } from "next-themes"
import { useHydrated } from "@tanstack/react-router"
import { Moon, Sun } from "lucide-react"
import { AnimatePresence, motion, useAnimationControls } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { springs } from "@/components/studio/motion"
import { prefersStillness } from "@/lib/preferences"
import { cn } from "@/lib/utils"
import { useQuirks } from "./quirks"

/** Sun turns into moon with a half-turn spring. Flip it enough times and it gets dizzy. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const dark = hydrated && resolvedTheme === "dark"
  const { unlock } = useQuirks()
  const flips = useRef<number[]>([])
  const [dizzy, setDizzy] = useState(false)
  const spin = useAnimationControls()

  useEffect(() => {
    if (!dizzy) return
    const timer = setTimeout(() => setDizzy(false), 2800)
    return () => clearTimeout(timer)
  }, [dizzy])

  const flip = () => {
    setTheme(dark ? "light" : "dark")
    const now = Date.now()
    flips.current = [...flips.current.filter((at) => now - at < 4000), now]
    if (flips.current.length >= 6) {
      flips.current = []
      setDizzy(true)
      unlock("indecisive")
      if (!prefersStillness())
        void spin.start({
          rotate: [0, -25, 720],
          transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
        })
    }
  }

  return (
    <span className="relative flex">
      <motion.button
        type="button"
        aria-label="Toggle dark mode"
        aria-pressed={dark}
        onClick={flip}
        animate={spin}
        className={cn(
          "pressable-flat relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full border-[1.5px] border-ink text-ink hover:bg-paper-sunk",
          className
        )}
      >
        <motion.span
          className="absolute grid place-items-center"
          initial={false}
          animate={{
            rotate: dark ? 180 : 0,
            scale: dark ? 0.4 : 1,
            opacity: dark ? 0 : 1,
          }}
          transition={springs.lift}
        >
          <Sun
            aria-hidden="true"
            className="size-[1.05rem]"
            strokeWidth={2.2}
          />
        </motion.span>
        <motion.span
          className="absolute grid place-items-center"
          initial={false}
          animate={{
            rotate: dark ? 0 : -180,
            scale: dark ? 1 : 0.4,
            opacity: dark ? 1 : 0,
          }}
          transition={springs.lift}
        >
          <Moon
            aria-hidden="true"
            className="size-[1.05rem]"
            strokeWidth={2.2}
          />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {dizzy && (
          <motion.span
            role="status"
            className="absolute top-full right-0 mt-4 flex w-max flex-col rounded-[14px] border-2 border-ink bg-paper-raised px-4 py-2.5 text-sm text-ink shadow-small"
            style={{ originX: 1, originY: 0 }}
            initial={{ scale: 0.3, rotate: 8, opacity: 0 }}
            animate={{ scale: 1, rotate: -2, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={springs.pop}
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
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
