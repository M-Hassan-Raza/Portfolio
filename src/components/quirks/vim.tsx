import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { usePrefersReducedMotion } from "@/lib/ascii/media"
import { cn } from "@/lib/utils"

type Mode = "normal" | "insert" | "command"
type Message = { text: string; error?: boolean } | null

const intro = [
  "VIM - Vi IMproved",
  "",
  "portfolio edition",
  "Vim is open source and freely distributable",
  "",
  "type  :q<Enter>       to exit",
  "type  i               to start typing",
  "type  :help<Enter>    for help",
  "",
  "Thank you, Bram.",
]

const quitting = new Set(["q", "q!", "qa", "qa!", "quit", "quit!", "x", "xa"])

/**
 * Enough of vim to get stuck in, and the real way out. It stays faithful
 * where it's funny: :q refuses with unsaved changes (E37), :wq has no file
 * name (E32), Ctrl+C tells you about :qa!. Leaving properly is a secret.
 */
export function Vim({
  onExit,
  onEscaped,
}: {
  onExit: () => void
  onEscaped: () => void
}) {
  const root = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [mode, setMode] = useState<Mode>("normal")
  const [text, setText] = useState("")
  const [saved, setSaved] = useState("")
  const [command, setCommand] = useState("")
  const [message, setMessage] = useState<Message>(null)
  const [numbers, setNumbers] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [stuck, setStuck] = useState(false)
  const pendingZ = useRef(false)

  useEffect(() => {
    root.current?.focus()
    const timer = setTimeout(() => setStuck(true), 6000)
    return () => clearTimeout(timer)
  }, [])

  const leave = (escaped: boolean) => {
    if (escaped) onEscaped()
    if (reduced) onExit()
    else setLeaving(true)
  }

  const modified = text !== saved
  const lines = text.split("\n")

  function execute(raw: string) {
    const cmd = raw.trim()
    const [verb = "", ...rest] = cmd.split(/\s+/)
    if (quitting.has(verb)) {
      if (modified && !verb.endsWith("!") && !verb.startsWith("x"))
        return setMessage({
          text: "E37: No write since last change (add ! to override)",
          error: true,
        })
      if (verb.startsWith("x") && modified && !rest[0])
        return setMessage({ text: "E32: No file name", error: true })
      return leave(true)
    }
    if (verb === "w" || verb === "wq" || verb === "wq!" || verb === "w!") {
      if (!rest[0])
        return setMessage({ text: "E32: No file name", error: true })
      setSaved(text)
      const bytes = new TextEncoder().encode(text).length
      setMessage({
        text: `"${rest[0]}" [New] ${lines.length}L, ${bytes}B written`,
      })
      if (verb.startsWith("wq")) leave(true)
      return
    }
    if (verb === "help" || verb === "h")
      return setMessage({
        text: "E149: Sorry, no help for portfolio. You want :q",
        error: true,
      })
    if (verb === "set" && (rest[0] === "nu" || rest[0] === "number")) {
      setNumbers(true)
      return setMessage(null)
    }
    if (verb === "set" && (rest[0] === "nonu" || rest[0] === "nonumber")) {
      setNumbers(false)
      return setMessage(null)
    }
    if (verb.startsWith("!"))
      return setMessage({
        text: "E145: Shell commands not allowed in a browser",
        error: true,
      })
    if (verb === "") return setMessage(null)
    setMessage({ text: `E492: Not an editor command: ${cmd}`, error: true })
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    event.stopPropagation()
    if (event.metaKey || leaving) return
    event.preventDefault()
    const { key } = event
    if (event.ctrlKey) {
      if (key === "c") {
        setMode("normal")
        setCommand("")
        setMessage({
          text: "Type  :qa!  and press <Enter> to abandon all changes and exit Vim",
        })
      }
      return
    }
    if (mode === "insert") {
      if (key === "Escape") setMode("normal")
      else if (key === "Backspace") setText((value) => value.slice(0, -1))
      else if (key === "Enter") setText((value) => `${value}\n`)
      else if (key.length === 1)
        setText((value) => (value + key).slice(0, 4000))
      return
    }
    if (mode === "command") {
      if (key === "Escape") {
        setMode("normal")
        setCommand("")
      } else if (key === "Enter") {
        setMode("normal")
        setCommand("")
        execute(command)
      } else if (key === "Backspace") {
        if (command === "") setMode("normal")
        else setCommand((value) => value.slice(0, -1))
      } else if (key.length === 1) setCommand((value) => value + key)
      return
    }
    // Normal mode.
    if (key === "Z") {
      if (pendingZ.current) {
        pendingZ.current = false
        if (modified) setMessage({ text: "E32: No file name", error: true })
        else leave(true)
      } else pendingZ.current = true
      return
    }
    pendingZ.current = false
    setMessage(null)
    if (key === ":") {
      setMode("command")
      setCommand("")
    } else if (key === "i" || key === "a" || key === "A" || key === "I")
      setMode("insert")
    else if (key === "o") {
      setText((value) => `${value}\n`)
      setMode("insert")
    } else if (key === "u") setMessage({ text: "Already at oldest change" })
    else if (key === "Escape")
      root.current?.animate(
        [{ opacity: 1 }, { opacity: 0.85 }, { opacity: 1 }],
        120
      )
  }

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Vim. Type colon, q, Enter to leave."
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && leaving) onExit()
      }}
      className={cn(
        "fixed inset-0 z-modal flex flex-col bg-term-plate font-mono text-[0.9375rem] leading-[1.45] text-term-ink outline-none",
        leaving && "crt-off"
      )}
    >
      <div className="relative flex-1 overflow-hidden px-2 pt-2">
        {lines.map((line, index) => (
          <div key={index} className="flex whitespace-pre">
            {numbers && (
              <span className="w-10 shrink-0 pr-2 text-right text-term-accent">
                {index + 1}
              </span>
            )}
            <span>{line}</span>
            {index === lines.length - 1 && mode !== "command" && (
              <span
                aria-hidden="true"
                className="caret"
                style={mode === "insert" ? { width: "0.15em" } : undefined}
              />
            )}
          </div>
        ))}
        {Array.from({ length: 80 }, (_, index) => (
          <div key={index} aria-hidden="true" className="text-term-link">
            ~
          </div>
        ))}
        {text === "" && mode === "normal" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center whitespace-pre text-term-soft">
            {intro.map((line, index) => (
              <div
                key={index}
                className={index === 0 ? "text-term-ink" : undefined}
              >
                {line || " "}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 px-2 py-1 whitespace-pre">
        <span
          className={cn(
            message?.error && "bg-term-error px-1 text-term-plate",
            mode === "insert" && "font-bold"
          )}
        >
          {mode === "insert" ? (
            "-- INSERT --"
          ) : mode === "command" ? (
            <>
              :{command}
              <span aria-hidden="true" className="caret" />
            </>
          ) : (
            (message?.text ?? (modified ? "[No Name] [+]" : " "))
          )}
        </span>
        <span className="flex items-center gap-6 text-term-soft">
          <span>
            {lines.length},{(lines.at(-1)?.length ?? 0) + 1}
          </span>
          <span>All</span>
        </span>
      </div>
      {stuck && !leaving && (
        <button
          type="button"
          onClick={() => {
            setMessage({ text: "Fine. :q! for you. Nobody saw anything." })
            setTimeout(() => leave(false), 700)
          }}
          className="pressable absolute right-4 bottom-12 cursor-pointer rounded-full border-2 border-term-ink bg-term-raised px-4 py-2 font-sans text-sm font-semibold text-term-ink"
        >
          I'm stuck
        </button>
      )}
    </div>
  )
}
