import { AnimatePresence, MotionConfig } from "motion/react"
import type { EggId } from "@/lib/quirks"
import { usePreferences } from "@/lib/preferences"
import { AsciiRain } from "./ascii-rain"
import {
  HireScene,
  KonamiScene,
  LeetBanner,
  LeetcodeScene,
  RestoreScreen,
  SecretBadge,
  TypingHud,
} from "./scenes"
import { Terminal } from "./terminal"
import type { TerminalBridge } from "./terminal"
import { Vim } from "./vim"

export type SceneState =
  | { kind: "terminal"; handoff?: string; key: number }
  | { kind: "konami" | "rain" | "vim" | "leetcode" | "hire" }
  | null

/**
 * Everything the easter eggs put on screen. Its own chunk, with Motion, so a
 * visitor who never finds an egg never downloads it: QuirksProvider loads it
 * the first time anything here has to show.
 */
export default function Stage({
  scene,
  suspended,
  restoring,
  leetSeconds,
  badge,
  hud,
  total,
  bridge,
  closeScene,
  unlock,
}: {
  scene: SceneState
  suspended: boolean
  restoring: boolean
  /** Set while 1337 mode is on: how long its banner stays. */
  leetSeconds: number | null
  badge: { name: string; place: number } | null
  hud: string | null
  /** How many eggs there are, for the badge. */
  total: number
  bridge: TerminalBridge
  closeScene: () => void
  unlock: (id: EggId) => void
}) {
  const { reduceMotion } = usePreferences()
  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <AnimatePresence>
        {scene?.kind === "terminal" && (
          <Terminal
            key={scene.key}
            handoff={scene.handoff}
            suspended={suspended}
            onClose={closeScene}
            bridge={bridge}
          />
        )}
      </AnimatePresence>
      {scene?.kind === "vim" && (
        <Vim onExit={closeScene} onEscaped={() => unlock("vim-quit")} />
      )}
      {scene?.kind === "rain" && <AsciiRain onDone={closeScene} />}
      <AnimatePresence>
        {scene?.kind === "konami" && (
          <KonamiScene key="konami" onDone={closeScene} />
        )}
      </AnimatePresence>
      {scene?.kind === "leetcode" && <LeetcodeScene onClose={closeScene} />}
      {scene?.kind === "hire" && <HireScene onClose={closeScene} />}
      {restoring && <RestoreScreen />}
      <AnimatePresence>
        {leetSeconds !== null && (
          <LeetBanner key="leet" seconds={leetSeconds} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {badge && (
          <SecretBadge
            key={badge.place}
            name={badge.name}
            place={badge.place}
            total={total}
            top={scene?.kind === "vim"}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {hud && !scene && <TypingHud key="hud" text={hud} />}
      </AnimatePresence>
    </MotionConfig>
  )
}
