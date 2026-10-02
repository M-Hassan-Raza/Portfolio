import { animate, motion } from "motion/react"
import { useEffect, useState } from "react"
import { profile } from "#content"
import { springs } from "@/components/studio/motion"
import { PillButton, PillLink } from "@/components/studio/pill"
import { Shape } from "@/components/studio/shape"
import { PanelDialog } from "@/components/system/overlays"
import { useCopy } from "@/components/system/copy"
import { usePrefersReducedMotion } from "@/lib/ascii/media"
import { jolt } from "@/lib/quirks-effects"
import { page } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { Confetti } from "./confetti"

/* ── Konami ────────────────────────────────────────────────────────────── */

/** The title slams down, the page takes the hit, the stickers fly. */
export function KonamiScene({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    const landed = setTimeout(() => !reduced && jolt(), 220)
    const done = setTimeout(onDone, 3200)
    return () => {
      clearTimeout(landed)
      clearTimeout(done)
    }
  }, [onDone, reduced])
  return (
    <>
      {!reduced && <Confetti onDone={() => {}} />}
      <div
        role="status"
        className="pointer-events-none fixed inset-0 z-popover grid place-items-center px-4"
      >
        <motion.div
          data-block="lemon"
          className="flex flex-col items-center gap-2 rounded-[22px] border-2 border-ink bg-block px-8 py-6 text-on-block shadow-lift"
          initial={{ scale: 0, rotate: -16 }}
          animate={{ scale: 1, rotate: -4 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={springs.pop}
        >
          <span className="type-title">+30 lives</span>
          <span className="type-label tracking-[0.3em]">
            ↑ ↑ ↓ ↓ ← → ← → B A
          </span>
        </motion.div>
      </div>
    </>
  )
}

/* ── leetcode ──────────────────────────────────────────────────────────── */

/** A bell curve of everyone else's runtimes, and you, alone at 0 ms. */
const runtimes = Array.from({ length: 26 }, (_, index) =>
  index === 0 ? 10 : 8 + 88 * Math.exp(-((index - 14) ** 2) / 30)
)

function RuntimeChart() {
  return (
    <figure className="flex flex-col gap-2">
      <div className="relative flex h-28 items-end gap-1">
        {runtimes.map((height, index) => (
          <motion.div
            key={index}
            className={
              index === 0
                ? "flex-1 rounded-t-[4px] bg-grass"
                : "flex-1 rounded-t-[4px] bg-line-strong"
            }
            style={{ height: `${height}%`, originY: 1 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ ...springs.settle, delay: 0.35 + index * 0.025 }}
          />
        ))}
        <motion.span
          className="absolute bottom-[18%] left-0 rounded-full border-[1.5px] border-ink bg-paper-raised px-2 py-0.5 text-xs font-bold"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.pop, delay: 1.1 }}
        >
          you
        </motion.span>
      </div>
      <figcaption className="flex justify-between text-xs text-ink-soft">
        <span>0 ms</span>
        <span>runtime distribution</span>
        <span>96 ms</span>
      </figcaption>
    </figure>
  )
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border-[1.5px] border-ink p-4">
      <span className="type-label text-ink-soft">{label}</span>
      <span className="text-3xl font-extrabold tracking-[-0.03em]">
        {value}
      </span>
      <span className="text-sm font-semibold text-grass-text">
        Beats 100.00%
      </span>
    </div>
  )
}

export function LeetcodeScene({ onClose }: { onClose: () => void }) {
  const [attempt, setAttempt] = useState(0)
  const [passed, setPassed] = useState(0)
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (reduced) {
      setPassed(1337)
      return
    }
    setPassed(0)
    const counting = animate(0, 1337, {
      duration: 1.3,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => setPassed(Math.round(value)),
    })
    return () => counting.stop()
  }, [attempt, reduced])

  return (
    <PanelDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Accepted"
      titleClassName="text-[2.25rem] text-grass-text"
      description="Submitted by visitor, just now."
      className="sm:max-w-xl"
    >
      <div key={attempt} className="flex flex-col gap-5">
        <p className="type-label tabular">{passed} / 1337 testcases passed</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Result label="Runtime" value="0 ms" />
          <Result label="Memory" value="1 HTML file" />
        </div>
        <RuntimeChart />
        <pre className="overflow-x-auto rounded-[14px] bg-code-surface p-4 font-mono text-sm leading-relaxed text-code-foreground">
          {`class Solution:
    def hire(self, problem: str) -> str:
        return "${profile.email}"  # O(1), every time`}
        </pre>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <PillButton
          variant="paper"
          size="sm"
          onClick={() => setAttempt((n) => n + 1)}
        >
          Submit again
        </PillButton>
        <PillButton size="sm" onClick={onClose}>
          Close
        </PillButton>
      </div>
    </PanelDialog>
  )
}

/* ── hire me ───────────────────────────────────────────────────────────── */

/** The flap folds back and a letter with my address climbs out. */
function Envelope() {
  const fold = { transformBox: "fill-box", transformOrigin: "50% 0%" } as const
  const unfold = {
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
  } as const
  return (
    <svg
      data-block="pink"
      viewBox="0 -40 260 230"
      className="mx-auto h-auto w-60 overflow-visible"
      role="img"
      aria-label="An envelope opens and a letter slides out"
    >
      <rect
        x="20"
        y="60"
        width="220"
        height="120"
        rx="10"
        className="text-block-deep"
        fill="currentColor"
      />
      <motion.path
        d="M20 64 L130 0 L240 64 Z"
        className="text-block-deep"
        fill="currentColor"
        style={unfold}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.25, delay: 0.38, ease: "easeOut" }}
      />
      <motion.g
        initial={{ y: 72 }}
        animate={{ y: -14 }}
        transition={{ ...springs.settle, delay: 0.7 }}
      >
        <rect
          x="42"
          y="36"
          width="176"
          height="112"
          rx="8"
          className="text-paper-fixed"
          fill="currentColor"
        />
        <text
          x="130"
          y="70"
          textAnchor="middle"
          className="font-sans text-[13px] font-extrabold text-ink-fixed"
          fill="currentColor"
        >
          Let's build something.
        </text>
        <text
          x="130"
          y="92"
          textAnchor="middle"
          className="font-sans text-[11px] font-semibold text-ink-fixed"
          fill="currentColor"
        >
          {profile.email}
        </text>
        <rect
          x="70"
          y="106"
          width="120"
          height="4"
          rx="2"
          className="text-paper-fixed-sunk"
          fill="currentColor"
        />
        <rect
          x="86"
          y="116"
          width="88"
          height="4"
          rx="2"
          className="text-paper-fixed-sunk"
          fill="currentColor"
        />
      </motion.g>
      <path
        d="M20 84 L130 146 L240 84 V170 Q240 180 230 180 H30 Q20 180 20 170 Z"
        className="text-block"
        fill="currentColor"
      />
      <motion.path
        d="M20 64 L130 128 L240 64 Z"
        className="text-block"
        fill="currentColor"
        style={fold}
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.38, delay: 0.1, ease: "easeIn" }}
      />
    </svg>
  )
}

export function HireScene({ onClose }: { onClose: () => void }) {
  const { copy } = useCopy()
  return (
    <PanelDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Good call."
      description="Email is the fastest way to reach me. The contact page has the longer version: what I take on and how I work."
      className="sm:max-w-md"
    >
      <Envelope />
      <div className="flex flex-wrap items-center justify-end gap-3">
        <PillButton
          variant="paper"
          size="sm"
          onClick={() => void copy(profile.email, "Email copied")}
        >
          Copy email
        </PillButton>
        <PillLink to={page("/contact/")} size="sm" onClick={onClose}>
          How I work
        </PillLink>
      </div>
    </PanelDialog>
  )
}

/* ── rm -rf / aftermath ────────────────────────────────────────────────── */

const barCells = 28

/** The empty screen after the fall: a caret, then a restore with a progress bar. */
export function RestoreScreen() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let run: ReturnType<typeof animate> | undefined
    const start = setTimeout(() => {
      run = animate(0, 100, {
        duration: 1.2,
        ease: [0.65, 0, 0.35, 1],
        onUpdate: (value) => setProgress(Math.round(value)),
      })
    }, 450)
    return () => {
      clearTimeout(start)
      run?.stop()
    }
  }, [])
  const filled = Math.round((progress / 100) * barCells)
  return (
    <div
      role="status"
      className="fixed inset-0 z-popover flex flex-col items-center justify-center gap-4 bg-paper px-4 font-mono text-ink"
    >
      {progress === 0 ? (
        <span aria-label="Empty screen" className="caret text-2xl" />
      ) : (
        <>
          <span className="text-sm text-ink-soft sm:text-base">
            $ restore --from=backup /
          </span>
          <span className="text-sm whitespace-pre sm:text-lg">
            [{"#".repeat(filled)}
            {"-".repeat(barCells - filled)}] {String(progress).padStart(3)}%
          </span>
          <span className="font-sans text-sm text-ink-soft">
            Relax. It's a static site.
          </span>
        </>
      )}
    </div>
  )
}

/* ── 1337 ──────────────────────────────────────────────────────────────── */

export function LeetBanner({ seconds }: { seconds: number }) {
  return (
    <motion.div
      role="status"
      className="fixed inset-x-0 top-20 z-toast flex justify-center px-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={springs.lift}
    >
      <div className="flex flex-col gap-1.5 overflow-clip rounded-full border-2 border-ink bg-term-plate px-5 pt-2 pb-2.5 font-mono text-sm text-term-prompt shadow-small">
        <span>1337 m0d3 0n. 8r4c3 y0ur53lf.</span>
        <motion.span
          className="block h-0.5 rounded-full bg-term-prompt"
          style={{ originX: 0 }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: seconds, ease: "linear" }}
        />
      </div>
    </motion.div>
  )
}

/* ── Achievement sticker and typing HUD ────────────────────────────────── */

export function SecretBadge({
  name,
  place,
  total,
  top = false,
}: {
  name: string
  place: number
  total: number
  /** Over full-screen scenes (vim) the bottom edge is taken, so it sits up top. */
  top?: boolean
}) {
  return (
    <motion.div
      role="status"
      className={cn(
        "pointer-events-none fixed z-toast flex items-center gap-3 rounded-full border-2 border-ink bg-paper-raised py-2 pr-5 pl-2 text-ink shadow-rest",
        top ? "top-4 right-4" : "bottom-4 left-4"
      )}
      initial={{ y: 60, rotate: -10, opacity: 0 }}
      animate={{ y: 0, rotate: -3, opacity: 1 }}
      exit={{ y: 60, rotate: 4, opacity: 0 }}
      transition={springs.pop}
    >
      <motion.span
        data-block="lemon"
        className="relative grid size-11 place-items-center text-block"
        initial={{ rotate: -120, scale: 0.4 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ ...springs.pop, delay: 0.12 }}
      >
        <Shape name="burst" className="absolute inset-0 size-full" />
        <span className="relative text-sm font-extrabold text-on-block tabular">
          {place}
        </span>
      </motion.span>
      <span className="flex flex-col">
        <span className="type-label text-ink-soft">
          Secret {place} of {total} found
        </span>
        <span className="font-extrabold tracking-[-0.02em]">{name}</span>
      </span>
    </motion.div>
  )
}

/** Shows a secret as it's being typed, so the page feels like it's listening. */
export function TypingHud({ text }: { text: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-toast flex justify-center"
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 16, opacity: 0 }}
      transition={springs.lift}
    >
      <span className="flex items-center gap-2 rounded-full bg-term-plate px-4 py-2 font-mono text-sm text-term-prompt shadow-small">
        <span className="text-term-soft">&gt;</span>
        {text}
        <span className="caret" />
      </span>
    </motion.div>
  )
}
