import { useNavigate } from "@tanstack/react-router"
import Fuse from "fuse.js"
import {
  ArrowUpRight,
  AtSign,
  FileText,
  FolderGit2,
  GitPullRequest,
  Link2,
  Moon,
  Rss,
  Sun,
} from "lucide-react"
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
import { mainNavigation, footerNavigation } from "@/lib/site"
import { blockFor, blockForSection } from "@/lib/studio"
import type { Surface } from "@/lib/studio"
import { useCopy } from "./copy"

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

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  )
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      } else if (event.key === "/" && !isTypingTarget(event.target)) {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
  const value = useMemo(() => ({ open, setOpen }), [open])
  return (
    <PaletteContext value={value}>
      {children}
      <CommandPalette open={open} setOpen={setOpen} />
    </PaletteContext>
  )
}

function CommandPalette({ open, setOpen }: PaletteState) {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const { copy } = useCopy()
  const trimmed = query.trim()
  const results = useMemo(
    () => (trimmed ? index.search(trimmed, { limit: 12 }) : []),
    [trimmed]
  )

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
              <CommandGroup heading="Actions">
                <PaletteItem
                  value="action copy email"
                  hue="ink"
                  icon={<AtSign aria-hidden="true" />}
                  meta={profile.email}
                  onSelect={() => {
                    close()
                    void copy(profile.email, "Email copied")
                  }}
                >
                  Copy email address
                </PaletteItem>
                <PaletteItem
                  value="action copy link"
                  hue="ink"
                  icon={<Link2 aria-hidden="true" />}
                  onSelect={() => {
                    close()
                    void copy(window.location.href, "Link copied")
                  }}
                >
                  Copy link to this page
                </PaletteItem>
                <PaletteItem
                  value="action theme"
                  hue="ink"
                  icon={
                    resolvedTheme === "dark" ? (
                      <Sun aria-hidden="true" />
                    ) : (
                      <Moon aria-hidden="true" />
                    )
                  }
                  onSelect={() => {
                    close()
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }}
                >
                  Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
                </PaletteItem>
                <PaletteItem
                  value="action github"
                  hue="ink"
                  icon={<GitPullRequest aria-hidden="true" />}
                  onSelect={() => go({ path: profile.links.github })}
                >
                  Open GitHub profile
                </PaletteItem>
                <PaletteItem
                  value="action rss"
                  hue="ink"
                  icon={<Rss aria-hidden="true" />}
                  onSelect={() => {
                    close()
                    window.location.assign("/index.xml")
                  }}
                >
                  RSS feed
                </PaletteItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
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
