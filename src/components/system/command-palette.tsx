import { useNavigate } from "@tanstack/react-router"
import Fuse from "fuse.js"
import {
  ArrowDownToLine,
  ArrowUpRight,
  ArrowUpToLine,
  AtSign,
  BookOpenText,
  Code,
  Contrast,
  Dices,
  FileText,
  FolderGit2,
  GitPullRequest,
  Keyboard,
  Link2,
  Moon,
  Palette,
  Pause,
  Printer,
  Rss,
  ScanLine,
  Sun,
  SquareTerminal,
  TextCursorInput,
  Type,
  Underline,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useTheme } from "next-themes"
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ComponentProps, ReactNode } from "react"
import { profile } from "#content"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import {
  pullRequestEntries,
  searchEntries,
  searchKindLabel,
} from "@/lib/content/search"
import type { SearchEntry } from "@/lib/content/search"
import { yearOf } from "@/lib/format"
import {
  stepTextSize,
  toggleCopy,
  togglePreference,
  usePreferences,
} from "@/lib/preferences"
import type { Toggle } from "@/lib/preferences"
import { eggForCommand } from "@/lib/quirks"
import { mainNavigation, footerNavigation } from "@/lib/site"
import { blockFor, blockForSection } from "@/lib/studio"
import type { Surface } from "@/lib/studio"
import { useCopy } from "./copy"
import { QuirksProvider, useQuirks } from "./quirks"

type PaletteState = { open: boolean; setOpen: (open: boolean) => void }
const PaletteContext = createContext<PaletteState | null>(null)

export function useCommandPalette() {
  const value = use(PaletteContext)
  if (!value) throw new Error("useCommandPalette needs CommandPaletteProvider")
  return value
}

const index = new Fuse([...searchEntries, ...pullRequestEntries], {
  keys: [
    { name: "title", weight: 3 },
    { name: "description", weight: 2 },
    "text",
  ],
  threshold: 0.35,
  ignoreLocation: true,
})

const pages = [
  ...mainNavigation,
  ...footerNavigation.filter(
    (item) => !mainNavigation.some((main) => main.path === item.path)
  ),
]

const kindIcon = {
  essay: FileText,
  project: FolderGit2,
  page: FileText,
  "pull-request": GitPullRequest,
} as const

const readable = searchEntries.filter(
  (entry) => entry.kind === "essay" || entry.kind === "project"
)

const sourceRepo = "https://github.com/M-Hassan-Raza/Portfolio"

const groups = ["Actions", "Reading", "Tools"] as const

type PaletteCommand = {
  id: string
  group: (typeof groups)[number]
  label: string
  keywords: string
  icon: LucideIcon
  meta?: string
  run: () => void
}

const toggleIcon: Record<Toggle, LucideIcon> = {
  reduceMotion: Pause,
  moreContrast: Contrast,
  underlineLinks: Underline,
  wideSpacing: TextCursorInput,
  legibleFont: Type,
}

/** The palette's design tokens, as CSS a designer can paste somewhere. */
function paletteAsCss() {
  const tokens = getComputedStyle(document.documentElement)
  const names = [
    "paper",
    "ink",
    "tomato",
    "ultramarine",
    "grass",
    "lemon",
    "violet",
    "pink",
  ]
  const lines = names.map(
    (name) => `  --${name}: ${tokens.getPropertyValue(`--${name}`).trim()};`
  )
  return `:root {\n${lines.join("\n")}\n}`
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      // A scene (terminal, vim, rain) owns the keyboard while it's up.
      if (document.documentElement.dataset.scene) return
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
  const value = useMemo(() => ({ open, setOpen }), [open])
  return (
    <PaletteContext value={value}>
      <QuirksProvider>
        {children}
        <CommandPalette open={open} setOpen={setOpen} />
      </QuirksProvider>
    </PaletteContext>
  )
}

function CommandPalette({ open, setOpen }: PaletteState) {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const { copy } = useCopy()
  const { openShortcuts, openReadingSettings, openTerminal, trigger } =
    useQuirks()
  const preferences = usePreferences()
  const trimmed = query.trim()

  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
  }, [setOpen])

  const go = useCallback(
    (entry: Pick<SearchEntry, "path">) => {
      close()
      if (/^https?:/.test(entry.path))
        window.open(entry.path, "_blank", "noopener")
      else void navigate({ to: entry.path })
    },
    [close, navigate]
  )

  const commands = useMemo<PaletteCommand[]>(() => {
    const dark = resolvedTheme === "dark"
    const outlined =
      open && document.documentElement.dataset.debug === "outline"
    return [
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        keywords: "mail contact",
        icon: AtSign,
        meta: profile.email,
        run: () => void copy(profile.email, "Email copied"),
      },
      {
        id: "copy-link",
        group: "Actions",
        label: "Copy link to this page",
        keywords: "url share yank",
        icon: Link2,
        meta: "y y",
        run: () => void copy(window.location.href, "Link copied"),
      },
      {
        id: "copy-markdown",
        group: "Actions",
        label: "Copy as Markdown link",
        keywords: "md share cite reference",
        icon: Code,
        run: () =>
          void copy(
            `[${document.title}](${window.location.href})`,
            "Markdown link copied"
          ),
      },
      {
        id: "theme",
        group: "Actions",
        label: `Switch to ${dark ? "light" : "dark"} theme`,
        keywords: "dark light mode appearance",
        icon: dark ? Sun : Moon,
        run: () => setTheme(dark ? "light" : "dark"),
      },
      {
        id: "random",
        group: "Actions",
        label: "Surprise me",
        keywords: "random essay project lucky",
        icon: Dices,
        run: () => {
          const pick = readable[Math.floor(Math.random() * readable.length)]
          if (pick) void navigate({ to: pick.path })
        },
      },
      {
        id: "terminal",
        group: "Tools",
        label: "Open a terminal",
        keywords: "shell console zsh bash command line quake",
        icon: SquareTerminal,
        meta: "`",
        run: () => openTerminal(),
      },
      {
        id: "shortcuts",
        group: "Actions",
        label: "Keyboard shortcuts",
        keywords: "keys hotkeys vim help",
        icon: Keyboard,
        meta: "?",
        run: openShortcuts,
      },
      {
        id: "github",
        group: "Actions",
        label: "Open GitHub profile",
        keywords: "code repos",
        icon: GitPullRequest,
        run: () => window.open(profile.links.github, "_blank", "noopener"),
      },
      {
        id: "rss",
        group: "Actions",
        label: "RSS feed",
        keywords: "subscribe feed reader",
        icon: Rss,
        run: () => window.location.assign("/index.xml"),
      },
      {
        id: "reading-settings",
        group: "Reading",
        label: "Reading settings",
        keywords: "accessibility a11y preferences",
        icon: BookOpenText,
        run: openReadingSettings,
      },
      {
        id: "text-bigger",
        group: "Reading",
        label: "Make text bigger",
        keywords: "font size zoom larger accessibility",
        icon: ZoomIn,
        meta: preferences.textSize === "larger" ? "Largest" : undefined,
        run: () => stepTextSize(1),
      },
      {
        id: "text-smaller",
        group: "Reading",
        label: "Make text smaller",
        keywords: "font size zoom accessibility",
        icon: ZoomOut,
        meta: preferences.textSize === "default" ? "Default" : undefined,
        run: () => stepTextSize(-1),
      },
      ...(Object.keys(toggleCopy) as Toggle[]).map((key) => ({
        id: key,
        group: "Reading" as const,
        label: toggleCopy[key].label,
        keywords: `${toggleCopy[key].detail} accessibility a11y`,
        icon: toggleIcon[key],
        meta: preferences[key] ? "On" : "Off",
        run: () => togglePreference(key),
      })),
      {
        id: "outline",
        group: "Tools",
        label: "Outline every box",
        keywords: "debug layout css pesticide boxes grid",
        icon: ScanLine,
        meta: outlined ? "On" : "Off",
        run: () => {
          const root = document.documentElement
          if (outlined) delete root.dataset.debug
          else root.dataset.debug = "outline"
        },
      },
      {
        id: "copy-tokens",
        group: "Tools",
        label: "Copy the colour palette as CSS",
        keywords: "design tokens colors oklch variables designer",
        icon: Palette,
        meta: "oklch",
        run: () => void copy(paletteAsCss(), "Palette copied"),
      },
      {
        id: "source",
        group: "Tools",
        label: "Read this site's source",
        keywords: "github code repo view source",
        icon: SquareTerminal,
        run: () => window.open(sourceRepo, "_blank", "noopener"),
      },
      {
        id: "top",
        group: "Tools",
        label: "Scroll to top",
        keywords: "up start",
        icon: ArrowUpToLine,
        meta: "g g",
        run: () => window.scrollTo({ top: 0 }),
      },
      {
        id: "bottom",
        group: "Tools",
        label: "Scroll to bottom",
        keywords: "down end footer",
        icon: ArrowDownToLine,
        meta: "⇧ G",
        run: () =>
          window.scrollTo({ top: document.documentElement.scrollHeight }),
      },
      {
        id: "print",
        group: "Tools",
        label: "Print or save as PDF",
        keywords: "pdf paper export",
        icon: Printer,
        run: () => setTimeout(() => window.print(), 150),
      },
    ]
  }, [
    copy,
    navigate,
    open,
    openReadingSettings,
    openShortcuts,
    openTerminal,
    preferences,
    resolvedTheme,
    setTheme,
  ])

  const commandIndex = useMemo(
    () =>
      new Fuse(commands, {
        keys: [{ name: "label", weight: 3 }, "keywords"],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [commands]
  )

  const results = useMemo(
    () => (trimmed ? index.search(trimmed, { limit: 12 }) : []),
    [trimmed]
  )
  const matchedCommands = useMemo(
    () =>
      trimmed
        ? commandIndex.search(trimmed, { limit: 5 }).map(({ item }) => item)
        : [],
    [commandIndex, trimmed]
  )
  const egg = eggForCommand(trimmed)

  const run = (command: PaletteCommand) => {
    close()
    command.run()
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close())}
      title="Search the site"
      description="Jump to writing, work, pull requests or an action."
      className="top-[14vh] max-w-[calc(100%-2rem)] rounded-[24px]! border-2 border-ink bg-paper-raised shadow-rest ring-0 sm:max-w-xl"
    >
      <Command
        shouldFilter={false}
        loop
        className="rounded-[24px]! bg-paper-raised p-2"
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search essays, case studies, pull requests..."
        />
        <CommandList
          data-slot="palette-list"
          className="max-h-[min(26rem,60vh)] px-1 pb-1"
        >
          <CommandEmpty className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="type-annotation text-lg text-ink-soft">
              Nothing matches “{trimmed}”. Try a project name.
            </span>
          </CommandEmpty>
          {trimmed ? (
            <>
              {egg && (
                <CommandGroup heading="Terminal">
                  <PaletteItem
                    value={`egg ${egg.id}`}
                    hue="grass"
                    icon={<SquareTerminal aria-hidden="true" />}
                    meta="Enter"
                    onSelect={() => {
                      close()
                      trigger(egg)
                    }}
                  >
                    <span className="font-mono">$ {trimmed}</span>
                  </PaletteItem>
                </CommandGroup>
              )}
              {matchedCommands.length > 0 && (
                <CommandGroup heading="Commands">
                  {matchedCommands.map((command) => (
                    <CommandRow
                      key={command.id}
                      command={command}
                      onRun={run}
                    />
                  ))}
                </CommandGroup>
              )}
              {results.length > 0 && (
                <CommandGroup heading={`${results.length} results`}>
                  {results.map(({ item }) => {
                    const Icon = kindIcon[item.kind]
                    return (
                      <PaletteItem
                        key={item.path}
                        value={item.path}
                        onSelect={() => go(item)}
                        hue={
                          item.kind === "pull-request"
                            ? "grass"
                            : item.kind === "page"
                              ? blockForSection(item.path)
                              : blockFor(item.path)
                        }
                        icon={<Icon aria-hidden="true" />}
                        meta={`${searchKindLabel[item.kind]}${item.date ? ` · ${yearOf(item.date)}` : ""}`}
                      >
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-semibold">
                            {item.title}
                          </span>
                          <span className="truncate text-xs text-ink-soft">
                            {item.description}
                          </span>
                        </span>
                      </PaletteItem>
                    )
                  })}
                </CommandGroup>
              )}
            </>
          ) : (
            <>
              <CommandGroup heading="Go to">
                {pages.map((page) => (
                  <PaletteItem
                    key={page.path}
                    value={`page ${page.label}`}
                    onSelect={() => go(page)}
                    hue={blockForSection(page.path)}
                    icon={<ArrowUpRight aria-hidden="true" />}
                  >
                    {page.label}
                  </PaletteItem>
                ))}
              </CommandGroup>
              {groups.map((group) => (
                <CommandGroup key={group} heading={group}>
                  {commands
                    .filter((command) => command.group === group)
                    .map((command) => (
                      <CommandRow
                        key={command.id}
                        command={command}
                        onRun={run}
                      />
                    ))}
                </CommandGroup>
              ))}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

function CommandRow({
  command,
  onRun,
}: {
  command: PaletteCommand
  onRun: (command: PaletteCommand) => void
}) {
  const Icon = command.icon
  return (
    <PaletteItem
      value={`command ${command.id}`}
      hue="ink"
      icon={<Icon aria-hidden="true" />}
      meta={command.meta}
      onSelect={() => onRun(command)}
    >
      {command.label}
    </PaletteItem>
  )
}

/** A result row: an outlined icon tile; the selected row floods with its destination's colour. */
function PaletteItem({
  hue,
  icon,
  meta,
  children,
  ...props
}: Omit<ComponentProps<typeof CommandItem>, "children"> & {
  hue: Surface
  icon: ReactNode
  meta?: string
  children: ReactNode
}) {
  return (
    <CommandItem
      data-block={hue}
      className="gap-3 rounded-[12px]! px-2.5 py-2 text-[0.9375rem] text-ink data-selected:bg-block data-selected:text-on-block [&[data-selected]_*]:text-on-block"
      {...props}
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-[9px] border-[1.5px] border-current [&_svg]:size-3.5!">
        {icon}
      </span>
      {children}
      {meta && (
        <CommandShortcut className="tracking-normal text-ink-soft">
          {meta}
        </CommandShortcut>
      )}
    </CommandItem>
  )
}
