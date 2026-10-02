import { useNavigate } from "@tanstack/react-router"
import { AnimatePresence } from "motion/react"
import { useTheme } from "next-themes"
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ReactNode } from "react"
import { flushSync } from "react-dom"
import { AsciiRain } from "@/components/quirks/ascii-rain"
import {
  HireScene,
  KonamiScene,
  LeetBanner,
  LeetcodeScene,
  RestoreScreen,
  SecretBadge,
  TypingHud,
} from "@/components/quirks/scenes"
import type { Scene } from "@/components/quirks/shell"
import { Terminal } from "@/components/quirks/terminal"
import type { TerminalBridge } from "@/components/quirks/terminal"
import { Vim } from "@/components/quirks/vim"
import { prefersStillness } from "@/lib/preferences"
import {
  bufferChar,
  eggs,
  goTo,
  isBacktick,
  isTypingTarget,
  markFound,
  readBuffer,
} from "@/lib/quirks"
import type { Egg, EggId } from "@/lib/quirks"
import { barrelRoll, fall, leetMode, wait } from "@/lib/quirks-effects"
import { page } from "@/lib/studio"
import { useCommandPalette } from "./command-palette"
import { useCopy } from "./copy"
import { ReadingSettingsDialog } from "./reading-settings"
import { ShortcutsDialog } from "./shortcuts-dialog"

type Quirks = {
  openShortcuts: () => void
  openReadingSettings: () => void
  openTerminal: (handoff?: string) => void
  trigger: (egg: Egg) => void
  unlock: (id: EggId) => void
}
const QuirksContext = createContext<Quirks | null>(null)

export function useQuirks() {
  const value = use(QuirksContext)
  if (!value) throw new Error("useQuirks needs QuirksProvider")
  return value
}

type SceneState =
  | { kind: "terminal"; handoff?: string; key: number }
  | { kind: "konami" | "rain" | "vim" | "leetcode" | "hire" }
  | null

/** Eggs without a terminal command, and the scene each one plays. */
const sceneFor: Partial<Record<EggId, Scene | "konami">> = {
  konami: "konami",
  leet: "leet",
  leetcode: "leetcode",
  matrix: "rain",
  "barrel-roll": "roll",
  vim: "vim",
  hire: "hire",
}

/** How long a chord (g h, y y) waits for its second key. */
const chordMs = 1000
/** How long "leet" waits to see if it becomes "leetcode". */
const pauseMs = 900
/** A pause this long and the typed buffer starts over. */
const forgetMs = 2000
const leetHoldMs = 6000

/**
 * Keyboard shortcuts, the typed easter eggs and the scenes they play.
 * Mounted once, inside the palette's context and around it.
 */
export function QuirksProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { copy } = useCopy()
  const { setOpen: setPaletteOpen } = useCommandPalette()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [scene, setScene] = useState<SceneState>(null)
  const [suspended, setSuspended] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [leet, setLeet] = useState(false)
  const [badge, setBadge] = useState<{ name: string; place: number } | null>(
    null
  )
  const [hud, setHud] = useState<string | null>(null)
  const busy = useRef(false)
  const sceneRef = useRef(scene)
  sceneRef.current = scene
  const shortcutsRef = useRef(shortcutsOpen)
  shortcutsRef.current = shortcutsOpen
  const badgeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const closeScene = useCallback(() => setScene(null), [])

  const unlock = useCallback((id: EggId) => {
    const place = markFound(id)
    if (place === null) return
    const egg = eggs.find((entry) => entry.id === id)
    setBadge({ name: egg?.name ?? id, place })
    clearTimeout(badgeTimer.current)
    badgeTimer.current = setTimeout(() => setBadge(null), 3200)
  }, [])

  /** Runs an effect that borrows the page, one at a time. */
  const exclusive = useCallback(async (run: () => Promise<unknown>) => {
    if (busy.current) return
    busy.current = true
    try {
      await run()
    } finally {
      busy.current = false
    }
  }, [])

  const play = useCallback(
    (name: Scene | "konami") => {
      const still = prefersStillness()
      switch (name) {
        case "vim":
          unlock("vim")
          setScene({ kind: "vim" })
          break
        case "rain":
          unlock("matrix")
          setScene({ kind: "rain" })
          break
        case "leetcode":
          unlock("leetcode")
          setScene({ kind: "leetcode" })
          break
        case "hire":
          unlock("hire")
          setScene({ kind: "hire" })
          break
        case "konami":
          unlock("konami")
          setScene({ kind: "konami" })
          break
        case "leet":
          unlock("leet")
          setScene(null)
          void exclusive(async () => {
            setLeet(true)
            await leetMode(leetHoldMs, still)
            setLeet(false)
          })
          break
        case "roll":
          unlock("barrel-roll")
          setScene(null)
          if (!still) void exclusive(barrelRoll)
          break
      }
    },
    [exclusive, unlock]
  )

  const openTerminal = useCallback((handoff?: string) => {
    // Synchronous, so the very next keystroke lands in the prompt.
    flushSync(() => setScene({ kind: "terminal", handoff, key: Date.now() }))
  }, [])

  const trigger = useCallback(
    (egg: Egg) => {
      if ("command" in egg) openTerminal(egg.command)
      else {
        const name = sceneFor[egg.id]
        if (name) play(name)
      }
    },
    [openTerminal, play]
  )

  /** rm -rf /: the terminal steps aside, the page falls, a restore runs, it all comes back. */
  const wreck = useCallback(async () => {
    if (prefersStillness() || busy.current) return false
    busy.current = true
    try {
      setSuspended(true)
      await wait(520)
      const rise = await fall()
      setRestoring(true)
      await wait(2100)
      setRestoring(false)
      await rise()
      setSuspended(false)
      return true
    } finally {
      busy.current = false
    }
  }, [])

  const bridge = useMemo<TerminalBridge>(
    () => ({
      found: unlock,
      navigate: (path) => void navigate({ to: page(path) }),
      play,
      wreck,
      setTheme,
    }),
    [navigate, play, setTheme, unlock, wreck]
  )

  // Lets the palette's ⌘K stand down while a scene owns the screen.
  useEffect(() => {
    const html = document.documentElement
    if (scene) html.dataset.scene = scene.kind
    else delete html.dataset.scene
  }, [scene])

  useEffect(() => {
    let buffer = ""
    let progress = 0
    let pending: { key: string; at: number } | null = null
    let pauseTimer: ReturnType<typeof setTimeout> | undefined
    let hudTimer: ReturnType<typeof setTimeout> | undefined
    let lastKeyAt = 0

    const still = () => prefersStillness()
    const scroll = (top: number) =>
      window.scrollBy({ top, behavior: still() ? "auto" : "smooth" })
    const scrollTo = (top: number) =>
      window.scrollTo({ top, behavior: still() ? "auto" : "smooth" })

    const showHud = (text: string | null) => {
      setHud(text)
      clearTimeout(hudTimer)
      if (text) hudTimer = setTimeout(() => setHud(null), forgetMs)
    }

    /** Single keys and two-key chords. */
    function shortcut(event: KeyboardEvent) {
      const now = performance.now()
      const previous =
        pending && now - pending.at < chordMs ? pending.key : null
      pending = null
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (previous === "g") {
        if (event.key === "g") return scrollTo(0)
        const target = goTo.find((item) => item.key === event.key)
        if (target) return void navigate({ to: page(target.path) })
      }
      if (previous === "y" && event.key === "y")
        return void copy(window.location.href, "Yanked this page's link")
      switch (event.key) {
        case "/":
          event.preventDefault()
          setPaletteOpen(true)
          return
        case "?":
          event.preventDefault()
          setShortcutsOpen((open) => !open)
          return
        case "j":
          return scroll(window.innerHeight * 0.2)
        case "k":
          return scroll(-window.innerHeight * 0.2)
        case "G":
          return scrollTo(document.documentElement.scrollHeight)
        case "g":
        case "y":
          pending = { key: event.key, at: now }
      }
    }

    /**
     * Secrets are read before shortcuts. Once two or more keys spell the
     * start of a secret, the keys belong to the secret: "/" won't open the
     * palette, "k" won't scroll, and space and arrows won't move the page.
     */
    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return
      if (sceneRef.current || busy.current) return
      if (isTypingTarget(event.target)) return
      if (
        event.target instanceof Element &&
        event.target.closest("[role=dialog]")
      ) {
        if (event.key === "?" && shortcutsRef.current) {
          event.preventDefault()
          setShortcutsOpen(false)
        }
        return
      }
      const plain = !event.metaKey && !event.ctrlKey && !event.altKey
      if (plain && isBacktick(event)) {
        event.preventDefault()
        buffer = ""
        showHud(null)
        openTerminal()
        return
      }

      const char = bufferChar(event)
      if (char !== null) {
        const now = performance.now()
        if (now - lastKeyAt > forgetMs) {
          buffer = ""
          progress = 0
        }
        lastKeyAt = now
        if (char === "") {
          if (progress >= 2) {
            event.preventDefault()
            return
          }
        } else {
          buffer = (buffer + char).slice(-24)
          clearTimeout(pauseTimer)
          const read = readBuffer(buffer)
          progress = read.progress
          if (read.match) {
            const { egg } = read.match
            const fire = () => {
              buffer = ""
              progress = 0
              showHud(null)
              trigger(egg)
            }
            event.preventDefault()
            pending = null
            if (read.match.wait) {
              showHud(read.spelled)
              pauseTimer = setTimeout(fire, pauseMs)
            } else fire()
            return
          }
          showHud(progress >= 3 ? read.spelled : null)
          if (progress >= 2) {
            if (/^Arrow|^\/$|^'$/.test(event.key)) event.preventDefault()
            pending = null
            return
          }
        }
      }
      shortcut(event)
    }

    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      clearTimeout(pauseTimer)
      clearTimeout(hudTimer)
    }
  }, [copy, navigate, openTerminal, setPaletteOpen, trigger])

  useEffect(() => {
    greetDevelopers()
  }, [])

  const value = useMemo(
    () => ({
      openShortcuts: () => setShortcutsOpen(true),
      openReadingSettings: () => setSettingsOpen(true),
      openTerminal,
      trigger,
      unlock,
    }),
    [openTerminal, trigger, unlock]
  )

  return (
    <QuirksContext value={value}>
      {children}
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <ReadingSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
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
        {leet && <LeetBanner key="leet" seconds={leetHoldMs / 1000 + 0.6} />}
      </AnimatePresence>
      <AnimatePresence>
        {badge && (
          <SecretBadge
            key={badge.place}
            name={badge.name}
            place={badge.place}
            total={eggs.length}
            top={scene?.kind === "vim"}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {hud && !scene && <TypingHud key="hud" text={hud} />}
      </AnimatePresence>
    </QuirksContext>
  )
}

let greeted = false

/** A note for whoever opens the console. Colours come from the theme. */
function greetDevelopers() {
  if (greeted) return
  greeted = true
  const tokens = getComputedStyle(document.documentElement)
  const block = tokens.getPropertyValue("--tomato").trim()
  const ink = tokens.getPropertyValue("--ink-fixed").trim()
  console.log(
    "%c Hassan Raza %c\n\nPoking around? The source is open: https://github.com/M-Hassan-Raza/Portfolio\nPress ` for a terminal, ? for shortcuts. Some commands aren't listed anywhere; try what you'd type at a prompt.",
    `background:${block};color:${ink};font:800 20px/1.6 system-ui;padding:4px 10px;border-radius:6px`,
    "font:13px/1.5 ui-monospace,monospace"
  )
}
