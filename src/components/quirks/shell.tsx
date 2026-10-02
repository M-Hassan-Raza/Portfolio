import type { ReactNode } from "react"
import { profile } from "#content"
import { searchEntries } from "@/lib/content/search"
import type { EggId } from "@/lib/quirks"
import { ping as measure } from "@/lib/quirks-effects"
import { Locomotive, Sandwich, Stamp, Teapot, cow } from "./graphics"

/**
 * A small shell for the drop-down terminal. Commands print React nodes, so
 * output can be text or a drawing. Long-running ones await `sleep`, which
 * rejects on Ctrl+C.
 */

export type Tone =
  "ink" | "soft" | "faint" | "prompt" | "error" | "accent" | "link"

export type Scene = "vim" | "rain" | "leet" | "leetcode" | "roll" | "hire"

export type Shell = {
  print: (node: ReactNode, tone?: Tone) => void
  /** Adds to the end of the last line instead of starting a new one. */
  append: (node: ReactNode, tone?: Tone) => void
  sleep: (ms: number) => Promise<void>
  signal: AbortSignal
  cwd: string
  history: string[]
  clear: () => void
  close: () => void
  shake: (kind: "no" | "hit") => void
  found: (id: EggId) => void
  navigate: (path: string) => void
  play: (scene: Scene) => void
  wreck: () => Promise<boolean>
  setTheme: (theme: string) => void
}

type Command = {
  names: string[]
  usage?: string
  summary?: string
  run: (args: string[], shell: Shell, raw: string) => void | Promise<void>
}

const host = () => window.location.host

/** Sections, as directories. */
const sections: Record<string, string> = {
  projects: "/projects/",
  work: "/projects/",
  blog: "/blog/",
  writing: "/blog/",
  "open-source": "/open-source/",
  oss: "/open-source/",
  books: "/books/",
  about: "/about/",
  contact: "/contact/",
  resume: "/resume/",
}
const listedSections = [
  "projects",
  "blog",
  "open-source",
  "books",
  "about",
  "contact",
]
const files = ["about.txt", "contact.txt", "resume.pdf"]
const resumeUrl = "/assets/muhammad-hassan-raza-resume.pdf"

const slugsIn = (prefix: string) =>
  searchEntries
    .filter((entry) => entry.path.startsWith(prefix) && entry.path !== prefix)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .map((entry) => entry.path.slice(prefix.length).replace(/\/$/, ""))

function resolvePath(target: string, cwd: string) {
  const clean = target.replace(/^~\/?/, "").replace(/\/+$/, "")
  if (clean === "" || target === "/" || target === "~") return "/"
  if (clean === "..") {
    const parts = cwd.split("/").filter(Boolean)
    parts.pop()
    return parts.length ? `/${parts.join("/")}/` : "/"
  }
  const [head, ...rest] = clean.replace(/^\.\//, "").split("/")
  const base = head ? sections[head] : undefined
  if (base && rest.length === 0) return base
  if (base && rest.length === 1) {
    const path = `${base}${rest[0]}/`
    return searchEntries.some((entry) => entry.path === path) ? path : null
  }
  // Relative to the current section: `cd some-essay` from ~/blog.
  const inCwd = `${cwd}${clean}/`
  return searchEntries.some((entry) => entry.path === inCwd) ? inCwd : null
}

/** "/blog/x/" → "~/blog/x" */
export const promptPath = (path: string) =>
  path === "/" ? "~" : `~${path.replace(/\/$/, "")}`

function Columns({ items, tone }: { items: string[]; tone?: Tone }) {
  return (
    <span className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-x-6">
      {items.map((item) => (
        <span key={item} className={toneClass[tone ?? "ink"]}>
          {item}
        </span>
      ))}
    </span>
  )
}

export const toneClass: Record<Tone, string> = {
  ink: "text-term-ink",
  soft: "text-term-soft",
  faint: "text-term-faint",
  prompt: "text-term-prompt",
  error: "text-term-error",
  accent: "text-term-accent",
  link: "text-term-link",
}

const fortunes = [
  "The bug is in the code you were sure about.",
  "Every quick fix has a sequel.",
  "Your future self reads your commit messages. Be kind.",
  "It was the cache. It is always the cache.",
  "Read the error message. All of it. Then read it again.",
  "Production is staging with an audience.",
  "Naming it took longer than writing it. That is normal.",
  "Code you delete can't break.",
  "The second system is always the one you wanted to build the first time.",
  "A test you never saw fail is a test you can't trust.",
]

const blame = [
  ["a3f9c21", "2017-09-14", 'print("hello, world")'],
  ["7be04d5", "2019-02-03", "# TODO: refactor this later"],
  ["c41e9a0", "2020-11-21", "except Exception: pass  # it's fine"],
  ["0d2f7b3", "2022-06-30", "# works on my machine"],
  ["e98a6c1", "2024-03-12", "cache.clear()  # trust me"],
  ["5f1b2ce", "2025-07-08", 'await agent.run("fix the bug")'],
  ["9c0de44", "2026-10-02", "# TODO: refactor this later"],
] as const

async function sudo(args: string[], shell: Shell) {
  const command = args.join(" ")
  shell.print("[sudo] password for visitor: ", "soft")
  for (let index = 0; index < 8; index++) {
    await shell.sleep(70)
    shell.append("*", "faint")
  }
  await shell.sleep(350)
  if (/^make me an? sandwich$/i.test(command)) {
    shell.print("\nOkay.", "prompt")
    shell.print(<Sandwich />)
    shell.print("xkcd 149. Root has its privileges.", "faint")
    shell.found("sudo-sandwich")
    return
  }
  if (/^rm\s+-(rf|fr|r)\s+(\/\*?|~)$/.test(command)) {
    shell.print("\nAs root? Bold.", "accent")
    return rm(args.slice(1), shell)
  }
  shell.print(
    `\nvisitor is not in the sudoers file.  This incident will be reported.`,
    "error"
  )
  shell.print(
    <span className="flex py-3 pl-6">
      <Stamp onLand={() => shell.shake("hit")}>Reported</Stamp>
    </span>
  )
  shell.found("sudo")
}

async function rm(args: string[], shell: Shell) {
  const flags = args.filter((arg) => arg.startsWith("-")).join("")
  const targets = args.filter((arg) => !arg.startsWith("-"))
  if (targets.length === 0) {
    shell.print("usage: rm [-f | -i] [-dIPRrvWx] file ...", "error")
    return
  }
  const recursive = /r/i.test(flags)
  const root = targets.some((target) => ["/", "/*", "~", "~/"].includes(target))
  if (!(recursive && root)) {
    shell.print(`rm: ${targets[0]}: Read-only file system`, "error")
    return
  }
  shell.found("rm-rf")
  const doomed = [
    ...searchEntries.map((entry) => entry.path),
    "/assets/fonts/",
    "/assets/favicon.svg",
    "/index.xml",
    "/sitemap.xml",
  ]
  for (const path of doomed.slice(0, 48)) {
    shell.print(`removed '${path}'`, "faint")
    await shell.sleep(22)
  }
  shell.print(`removed directory '/'`, "error")
  await shell.sleep(450)
  const wrecked = await shell.wreck()
  if (!wrecked) {
    shell.print(
      "rm: it is dangerous to operate recursively on '/'\nrm: use --no-preserve-root to override this failsafe",
      "error"
    )
    return
  }
  shell.print("Restored from backup, 2 seconds old.", "prompt")
  shell.print("Next time, keep --preserve-root.", "soft")
}

async function pingHost(args: string[], shell: Shell) {
  const target = args.find((arg) => !arg.startsWith("-")) ?? host()
  const self = [host(), "mhassan.dev", "localhost", "127.0.0.1"]
  if (!self.some((name) => target.startsWith(name))) {
    shell.print(
      `ping: ${target}: a static site can only ping itself. Try ping ${host()}`,
      "error"
    )
    return
  }
  shell.found("ping")
  shell.print(`PING ${host()}: 56 data bytes`)
  const times: number[] = []
  try {
    for (let sequence = 0; sequence < 4; sequence++) {
      const ms = await measure()
      if (ms === null)
        shell.print(`Request timeout for icmp_seq ${sequence}`, "error")
      else {
        times.push(ms)
        shell.print(
          <span>
            64 bytes from {host()}: icmp_seq={sequence} ttl=64 time=
            <span className="text-term-prompt">{ms.toFixed(1)}</span> ms
          </span>
        )
      }
      if (sequence < 3) await shell.sleep(1000)
    }
  } finally {
    if (times.length) {
      const min = Math.min(...times)
      const max = Math.max(...times)
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length
      shell.print(`\n--- ${host()} ping statistics ---`, "soft")
      shell.print(
        `${times.length} packets transmitted, ${times.length} packets received, 0.0% packet loss\nround-trip min/avg/max = ${min.toFixed(1)}/${avg.toFixed(1)}/${max.toFixed(1)} ms`,
        "soft"
      )
    }
  }
}

async function git(args: string[], shell: Shell) {
  const [sub, ...rest] = args
  switch (sub) {
    case "blame": {
      shell.found("blame")
      for (const [hash, date, code] of blame) {
        shell.print(
          <span>
            <span className="text-term-faint">{hash} </span>
            <span className="text-term-accent">(Hassan Raza {date}) </span>
            <span>{code}</span>
          </span>
        )
        await shell.sleep(110)
      }
      await shell.sleep(300)
      shell.print("\nEvery line, every year. It's always me.", "prompt")
      return
    }
    case "status":
      shell.print(
        "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean"
      )
      return
    case "push":
      if (rest.some((arg) => arg.startsWith("--force") || arg === "-f"))
        shell.print(
          new Date().getDay() === 5
            ? "remote: rejected. It's Friday. Go home."
            : "remote: rejected. Force-pushing to main? Not on my watch.",
          "error"
        )
      else shell.print("Everything up-to-date")
      return
    case "commit":
      shell.print("nothing to commit, working tree clean")
      return
    case "log":
      shell.print(
        blame
          .slice()
          .reverse()
          .map(([hash, date]) => `${hash} ${date}  Hassan Raza`)
          .join("\n"),
        "soft"
      )
      return
    case undefined:
      shell.print("usage: git <command> [<args>]  (try git blame)", "soft")
      return
    default:
      shell.print(
        `git: '${sub}' is not a git command. See 'git --help'.`,
        "error"
      )
  }
}

async function teapot(shell: Shell) {
  shell.found("teapot")
  shell.print(
    "HTTP/1.1 418 I'm a teapot\nContent-Type: tea/earl-grey\nX-Brewed-By: a static site",
    "accent"
  )
  shell.print(
    <span className="flex py-2 pl-4">
      <Teapot />
    </span>
  )
  shell.print("This server refuses to brew coffee. RFC 2324, 1998.", "soft")
}

const commands: Command[] = [
  {
    names: ["help", "man", "?"],
    usage: "help",
    summary: "this list",
    run: (_, shell) => {
      shell.print(
        <span className="grid grid-cols-[auto_1fr] gap-x-6">
          {commands
            .filter((command) => command.summary)
            .map((command) => (
              <span key={command.names[0]} className="contents">
                <span className="text-term-prompt">{command.usage}</span>
                <span className="text-term-soft">{command.summary}</span>
              </span>
            ))}
        </span>
      )
      shell.print(
        "\nThat's not everything. Some commands you have to guess.",
        "faint"
      )
    },
  },
  {
    names: ["ls", "dir", "ll", "la"],
    usage: "ls [dir]",
    summary: "list sections, or what's in one",
    run: (args, shell) => {
      const target = args.find((arg) => !arg.startsWith("-"))
      if (args.some((arg) => arg.startsWith("-l")))
        shell.print("total 1337", "faint")
      const path = target ? resolvePath(target, shell.cwd) : shell.cwd
      if (path === null) {
        shell.print(`ls: ${target}: No such file or directory`, "error")
        return
      }
      if (path === "/") {
        shell.print(
          <Columns
            items={listedSections.map((name) => `${name}/`)}
            tone="link"
          />
        )
        shell.print(<Columns items={files} />)
        return
      }
      const slugs = slugsIn(path)
      if (slugs.length === 0) {
        shell.print(`${promptPath(path)} has nothing to list. Try cd ~`, "soft")
        return
      }
      shell.print(<Columns items={slugs.slice(0, 40)} />)
      if (slugs.length > 40)
        shell.print(`...and ${slugs.length - 40} more`, "faint")
    },
  },
  {
    names: ["cd"],
    usage: "cd <dir>",
    summary: "go there (the page follows)",
    run: (args, shell) => {
      const path = resolvePath(args[0] ?? "~", shell.cwd)
      if (path === null)
        shell.print(`cd: no such file or directory: ${args[0]}`, "error")
      else shell.navigate(path)
    },
  },
  {
    names: ["pwd"],
    run: (_, shell) =>
      shell.print(promptPath(shell.cwd).replace("~", "/home/visitor")),
  },
  {
    names: ["open", "xdg-open"],
    usage: "open <file|dir>",
    summary: "open resume.pdf, a section, or an essay",
    run: (args, shell) => {
      const target = args[0] ?? ""
      if (target === "resume.pdf") {
        window.open(resumeUrl, "_blank", "noopener")
        return
      }
      if (target === "about.txt") return shell.navigate("/about/")
      if (target === "contact.txt") return shell.navigate("/contact/")
      const path = resolvePath(target, shell.cwd)
      if (path === null) shell.print(`open: ${target}: No such file`, "error")
      else shell.navigate(path)
    },
  },
  {
    names: ["cat", "less", "more", "bat"],
    usage: "cat <file>",
    summary: "print about.txt or contact.txt",
    run: (args, shell) => {
      const target = args[0]
      if (target === "about.txt") {
        shell.print(
          `${profile.name}\n${profile.now.role}, ${profile.now.org}. ${profile.location}.\n`
        )
        shell.print(profile.now.scope, "soft")
      } else if (target === "contact.txt") {
        shell.print(
          <span className="grid grid-cols-[auto_1fr] gap-x-6">
            <span className="text-term-soft">email</span>
            <a
              className="text-term-link underline"
              href={`mailto:${profile.email}`}
            >
              {profile.email}
            </a>
            <span className="text-term-soft">github</span>
            <a className="text-term-link underline" href={profile.links.github}>
              {profile.links.github.replace("https://", "")}
            </a>
            <span className="text-term-soft">linkedin</span>
            <a
              className="text-term-link underline"
              href={profile.links.linkedin}
            >
              {profile.links.linkedin.replace("https://", "")}
            </a>
          </span>
        )
      } else if (target === "resume.pdf")
        shell.print(
          "cat: resume.pdf: that's a binary. Try open resume.pdf",
          "error"
        )
      else
        shell.print(`cat: ${target ?? ""}: No such file or directory`, "error")
    },
  },
  {
    names: ["whoami", "who"],
    usage: "whoami",
    summary: "who you are, and who I am",
    run: (_, shell) => {
      shell.print("visitor")
      shell.print(
        `\nAnd this is ${profile.name}: ${profile.now.role} at ${profile.now.org}, in ${profile.location}. cat about.txt for more.`,
        "soft"
      )
    },
  },
  {
    names: ["ping"],
    usage: "ping",
    summary: "time a real round trip to this site",
    run: (args, shell) => pingHost(args, shell),
  },
  {
    names: ["theme"],
    usage: "theme <light|dark|system>",
    summary: "change the theme",
    run: (args, shell) => {
      const mode = args[0]
      if (mode && ["light", "dark", "system"].includes(mode)) {
        shell.setTheme(mode)
        shell.print(`theme: ${mode}`, "soft")
      } else shell.print("usage: theme <light|dark|system>", "error")
    },
  },
  {
    names: ["fortune"],
    usage: "fortune",
    summary: "a line of advice, free",
    run: (_, shell) =>
      shell.print(
        fortunes[Math.floor(Math.random() * fortunes.length)],
        "accent"
      ),
  },
  {
    names: ["history"],
    usage: "history",
    summary: "what you typed",
    run: (_, shell) =>
      shell.print(
        shell.history
          .map((line, index) => `${String(index + 1).padStart(4)}  ${line}`)
          .join("\n") || "(empty)",
        "soft"
      ),
  },
  {
    names: ["clear", "cls"],
    usage: "clear",
    summary: "wipe the screen (or Ctrl+L)",
    run: (_, shell) => shell.clear(),
  },
  {
    names: ["exit", "logout", "quit"],
    usage: "exit",
    summary: "close the terminal (or Esc, or `)",
    run: (_, shell) => shell.close(),
  },
  { names: ["echo"], run: (args, shell) => shell.print(args.join(" ")) },
  { names: ["date"], run: (_, shell) => shell.print(new Date().toString()) },
  {
    names: ["uname"],
    run: (_, shell) =>
      shell.print(
        "mhassan.dev 1.0 static html, served cold, no servers were harmed"
      ),
  },
  { names: ["sudo"], run: (args, shell) => sudo(args, shell) },
  {
    names: ["make"],
    run: (args, shell) => {
      const target = args.join(" ")
      if (/^me an? sandwich$/i.test(target)) {
        shell.print("What? Make it yourself.", "error")
        shell.shake("no")
        shell.found("sandwich")
      } else if (!target)
        shell.print(
          "make: *** No targets specified and no makefile found.  Stop.",
          "error"
        )
      else
        shell.print(
          `make: *** No rule to make target '${args[0]}'.  Stop.`,
          "error"
        )
    },
  },
  { names: ["rm"], run: (args, shell) => rm(args, shell) },
  { names: ["git"], run: (args, shell) => git(args, shell) },
  {
    names: ["xyzzy"],
    run: async (_, shell) => {
      shell.found("xyzzy")
      shell.print("Nothing happens.")
      await shell.sleep(900)
      shell.print(
        "\nYou are standing in a terminal on a portfolio. Exits are cd projects, cd blog and cd books.",
        "soft"
      )
    },
  },
  {
    names: ["plugh"],
    run: (_, shell) => shell.print("A hollow voice says “Fool.”", "soft"),
  },
  { names: ["coffee", "brew", "418"], run: (_, shell) => teapot(shell) },
  {
    names: ["sl"],
    run: (_, shell) => {
      shell.found("sl")
      shell.print(<Locomotive />)
      shell.print("You meant ls. Everyone means ls.", "faint")
    },
  },
  {
    names: ["cowsay"],
    run: (args, shell) => {
      shell.found("cowsay")
      shell.print(cow(args.join(" ")), "accent")
    },
  },
  {
    names: ["vim", "vi", "nvim", "nano", "emacs", "code"],
    run: async (_, shell, raw) => {
      if (raw.startsWith("emacs"))
        shell.print(
          "emacs: not installed. Opening vim, as nature intended.",
          "soft"
        )
      else if (raw.startsWith("nano"))
        shell.print("nano? Opening vim. You'll thank me.", "soft")
      else if (raw.startsWith("code"))
        shell.print("No Electron here. Opening vim.", "soft")
      await shell.sleep(
        raw.startsWith("vi") || raw.startsWith("nvim") ? 0 : 700
      )
      shell.play("vim")
    },
  },
  {
    names: [":q", ":q!", ":wq", ":x", ":qa!"],
    run: async (_, shell) => {
      shell.print("You're not in vim. Respect for the reflex, though.", "soft")
      await shell.sleep(700)
      shell.close()
    },
  },
  { names: ["matrix", "neo"], run: (_, shell) => shell.play("rain") },
  { names: ["leet", "1337", "l33t"], run: (_, shell) => shell.play("leet") },
  { names: ["leetcode"], run: (_, shell) => shell.play("leetcode") },
  {
    names: ["do", "barrel", "barrelroll"],
    run: (_, shell, raw) => {
      if (/barrel\s*roll/.test(raw)) shell.play("roll")
      else shell.print(`zsh: command not found: ${raw.split(" ")[0]}`, "error")
    },
  },
  {
    names: ["hire", "hireme"],
    run: (_, shell) => shell.play("hire"),
  },
  {
    names: ["konami"],
    run: (_, shell) =>
      shell.print(
        "Not here. Close this and try the arrow keys on the page.",
        "soft"
      ),
  },
]

const byName = new Map(
  commands.flatMap((command) => command.names.map((name) => [name, command]))
)

export const commandNames = [...byName.keys()].filter((name) =>
  /^[a-z]/.test(name)
)

/** Commands that run by themselves when handed to the terminal by a typed secret. */
export function isWholeSecret(line: string) {
  const text = line.trim().toLowerCase().replace(/\s+/g, " ")
  return [
    "sudo",
    "sudo make me a sandwich",
    "make me a sandwich",
    "rm -rf /",
    "sudo rm -rf /",
    "xyzzy",
    "brew coffee",
    "git blame",
    "ping",
  ].includes(text)
}

export function run(line: string, shell: Shell) {
  const raw = line.trim()
  if (!raw) return
  const [name = "", ...args] = raw.split(/\s+/)
  const command = byName.get(name.toLowerCase())
  if (!command) {
    shell.print(`zsh: command not found: ${name}`, "error")
    return
  }
  return command.run(args, shell, raw.toLowerCase())
}

/** Tab completion: the command, then a section or file. */
export function complete(line: string, cwd: string): string {
  const parts = line.split(" ")
  const last = parts.at(-1) ?? ""
  const pool =
    parts.length === 1
      ? commandNames
      : [
          ...listedSections.map((name) => `${name}/`),
          ...files,
          ...(cwd === "/" ? [] : slugsIn(cwd)),
        ]
  const hits = pool.filter((option) => option.startsWith(last))
  if (hits.length !== 1) return line
  parts[parts.length - 1] = hits[0] + (parts.length === 1 ? " " : "")
  return parts.join(" ")
}
