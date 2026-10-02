import { useRouterState } from "@tanstack/react-router"
import { X } from "lucide-react"
import { motion } from "motion/react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import type { KeyboardEvent, ReactNode } from "react"
import { springs } from "@/components/studio/motion"
import { isBacktick } from "@/lib/quirks"
import { complete, isWholeSecret, promptPath, run, toneClass } from "./shell"
import type { Shell, Tone } from "./shell"

type Line = { id: number; parts: { node: ReactNode; tone: Tone }[] }

export type TerminalBridge = Pick<
  Shell,
  "found" | "navigate" | "play" | "wreck" | "setTheme"
>

const lastLoginKey = "quirks-last-login"

function banner(): Line[] {
  let last: string | null = null
  try {
    last = localStorage.getItem(lastLoginKey)
    localStorage.setItem(lastLoginKey, new Date().toString())
  } catch {
    // No memory of past visits, so no "Last login" line.
  }
  const lines: Line["parts"][] = [
    ...(last
      ? [
          [
            {
              node: `Last login: ${new Date(last).toString().slice(0, 24)} on ttys001`,
              tone: "faint" as const,
            },
          ],
        ]
      : []),
    [
      {
        node: "mhassan.dev, a zsh of sorts. Type help to look around.",
        tone: "soft",
      },
    ],
  ]
  return lines.map((parts, index) => ({ id: -1 - index, parts }))
}

function Prompt({ path }: { path: string }) {
  return (
    <span className="shrink-0 whitespace-pre">
      <span className="text-term-prompt">visitor@mhassan.dev</span>{" "}
      <span className="text-term-link">{promptPath(path)}</span>{" "}
      <span className="text-term-soft">%</span>{" "}
    </span>
  )
}

/**
 * The drop-down console (backtick, the way Quake did it). Owns its output,
 * history and the running command; everything that touches the page goes
 * through `bridge`. A typed secret arrives as `handoff`, already in the
 * prompt, and runs itself once typing stops.
 */
export function Terminal({
  handoff,
  suspended,
  onClose,
  bridge,
}: {
  handoff?: string
  suspended: boolean
  onClose: () => void
  bridge: TerminalBridge
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [lines, setLines] = useState<Line[]>(banner)
  const [input, setInput] = useState(handoff ?? "")
  const [busy, setBusy] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLInputElement>(null)
  const history = useRef<string[]>([])
  const recall = useRef(-1)
  const running = useRef<AbortController | null>(null)
  const autorun = useRef<ReturnType<typeof setTimeout>>(undefined)
  const handedOff = useRef(!!handoff)
  const nextId = useRef(0)
  const cwd = useRef(pathname)
  cwd.current = pathname

  const print = useCallback((node: ReactNode, tone: Tone = "ink") => {
    setLines((current) => [
      ...current,
      { id: nextId.current++, parts: [{ node, tone }] },
    ])
  }, [])

  const append = useCallback((node: ReactNode, tone: Tone = "ink") => {
    setLines((current) => {
      const last = current.at(-1)
      if (!last) return [{ id: nextId.current++, parts: [{ node, tone }] }]
      return [
        ...current.slice(0, -1),
        { ...last, parts: [...last.parts, { node, tone }] },
      ]
    })
  }, [])

  const shake = useCallback((kind: "no" | "hit") => {
    panel.current?.animate(
      kind === "no"
        ? [
            { translate: "0 0" },
            { translate: "-14px 0" },
            { translate: "11px 0" },
            { translate: "-7px 0" },
            { translate: "4px 0" },
            { translate: "0 0" },
          ]
        : [
            { translate: "0 0", rotate: "0deg" },
            { translate: "0 9px", rotate: "-0.4deg" },
            { translate: "0 -4px", rotate: "0.3deg" },
            { translate: "0 2px", rotate: "0deg" },
            { translate: "0 0", rotate: "0deg" },
          ],
      {
        duration: kind === "no" ? 520 : 380,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      }
    )
  }, [])

  const close = useCallback(() => {
    running.current?.abort()
    onClose()
  }, [onClose])

  const submit = useCallback(
    async (line: string) => {
      clearTimeout(autorun.current)
      handedOff.current = false
      print(
        <span className="flex">
          <Prompt path={cwd.current} />
          <span>{line}</span>
        </span>
      )
      if (line.trim()) history.current.push(line.trim())
      recall.current = -1
      setInput("")
      const controller = new AbortController()
      running.current = controller
      setBusy(true)
      const shell: Shell = {
        ...bridge,
        print,
        append,
        shake,
        signal: controller.signal,
        cwd: cwd.current,
        history: history.current,
        clear: () => setLines([]),
        close,
        sleep: (ms) =>
          new Promise((resolve, reject) => {
            if (controller.signal.aborted)
              return reject(new DOMException("Interrupted", "AbortError"))
            const timer = setTimeout(resolve, ms)
            controller.signal.addEventListener(
              "abort",
              () => {
                clearTimeout(timer)
                reject(new DOMException("Interrupted", "AbortError"))
              },
              { once: true }
            )
          }),
      }
      try {
        await run(line, shell)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError"))
          print(String(error), "error")
      } finally {
        if (running.current === controller) running.current = null
        setBusy(false)
        field.current?.focus()
      }
    },
    [append, bridge, close, print, shake]
  )

  // A secret typed on the page runs once the typing stops, unless it grows
  // into something that isn't a whole secret any more.
  useEffect(() => {
    if (!handedOff.current) return
    clearTimeout(autorun.current)
    if (isWholeSecret(input))
      autorun.current = setTimeout(() => void submit(input), 850)
    return () => clearTimeout(autorun.current)
  }, [input, submit])

  useLayoutEffect(() => {
    const element = log.current
    if (element) element.scrollTop = element.scrollHeight
    // Drawings grow after they mount; follow them down.
    const timer = setTimeout(() => {
      if (element) element.scrollTop = element.scrollHeight
    }, 450)
    return () => clearTimeout(timer)
  }, [lines])

  useEffect(() => {
    if (!suspended) field.current?.focus()
  }, [suspended])

  useEffect(() => () => running.current?.abort(), [])

  // Navigating (cd) can pull focus to the page. Any key pressed outside
  // the panel comes back to the prompt, and Esc or ` still closes.
  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (panel.current?.contains(event.target as Node)) return
      if (isBacktick(event) || event.key === "Escape") {
        event.preventDefault()
        close()
      } else if (!event.metaKey && !suspended) field.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [close, suspended])

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    event.stopPropagation()
    const key = event.key.toLowerCase()
    if (isBacktick(event) || event.key === "Escape") {
      event.preventDefault()
      close()
    } else if (event.ctrlKey && key === "c") {
      event.preventDefault()
      if (running.current) {
        running.current.abort()
        print("^C", "soft")
      } else {
        print(
          <span className="flex">
            <Prompt path={cwd.current} />
            <span>{input}</span>
            <span className="text-term-soft">^C</span>
          </span>
        )
        setInput("")
      }
    } else if (event.ctrlKey && key === "l") {
      event.preventDefault()
      setLines([])
    } else if (event.ctrlKey && key === "d") {
      event.preventDefault()
      close()
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (!busy) void submit(input)
    } else if (event.key === "Tab") {
      event.preventDefault()
      setInput(complete(input, cwd.current))
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault()
      const past = history.current
      if (past.length === 0) return
      const next =
        event.key === "ArrowUp"
          ? recall.current === -1
            ? past.length - 1
            : Math.max(0, recall.current - 1)
          : recall.current === -1
            ? -1
            : recall.current + 1
      recall.current = next >= past.length ? -1 : next
      setInput(recall.current === -1 ? "" : (past[recall.current] ?? ""))
    }
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Terminal"
      className="fixed inset-x-0 top-0 z-modal px-3 pt-3"
      initial={{ y: "-110%" }}
      animate={{ y: suspended ? "-110%" : 0 }}
      exit={{ y: "-110%" }}
      transition={springs.sheet}
    >
      <div
        ref={panel}
        className="mx-auto flex h-[min(64dvh,560px)] max-w-content flex-col overflow-clip rounded-[24px] border-2 border-ink bg-term-plate font-mono text-term-ink shadow-rest"
      >
        <div className="flex items-center justify-between gap-4 border-b-[1.5px] border-term-raised py-2.5 pr-2.5 pl-5 text-xs text-term-soft">
          <span>visitor@mhassan.dev: {promptPath(pathname)} (zsh)</span>
          <span className="flex items-center gap-3">
            <span className="hidden sm:inline">` or Esc to close</span>
            <button
              type="button"
              onClick={close}
              aria-label="Close terminal"
              className="grid size-8 cursor-pointer place-items-center rounded-full text-term-soft hover:bg-term-raised hover:text-term-ink"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </span>
        </div>
        <div
          ref={log}
          role="log"
          aria-live="polite"
          onClick={() => {
            if (!window.getSelection()?.toString()) field.current?.focus()
          }}
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-5 py-4 text-[0.875rem] leading-relaxed sm:text-[0.9375rem]"
        >
          {lines.map((line) => (
            <div key={line.id} className="break-words whitespace-pre-wrap">
              {line.parts.map((part, index) => (
                <span key={index} className={toneClass[part.tone]}>
                  {part.node}
                </span>
              ))}
            </div>
          ))}
          <label className={busy ? "flex opacity-0" : "flex"}>
            <Prompt path={pathname} />
            <input
              ref={field}
              value={input}
              onChange={(event) => {
                recall.current = -1
                setInput(event.target.value)
              }}
              onKeyDown={onKeyDown}
              aria-label="Command"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-term-ink caret-term-accent outline-none"
            />
          </label>
        </div>
      </div>
    </motion.div>
  )
}
