import { useTheme } from "next-themes"
import { useHydrated } from "@tanstack/react-router"
import { Moon, Sun } from "lucide-react"
import { motion } from "motion/react"
import { springs } from "@/components/studio/motion"
import { cn } from "@/lib/utils"

/** Sun turns into moon with a half-turn spring. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const dark = hydrated && resolvedTheme === "dark"
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      aria-pressed={dark}
      onClick={() => setTheme(dark ? "light" : "dark")}
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
        <Sun aria-hidden="true" className="size-[1.05rem]" strokeWidth={2.2} />
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
        <Moon aria-hidden="true" className="size-[1.05rem]" strokeWidth={2.2} />
      </motion.span>
    </button>
  )
}
