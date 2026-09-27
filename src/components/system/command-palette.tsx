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
import type { ReactNode } from "react"
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
    >
      <Command shouldFilter={false} loop>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search essays, case studies, pull requests..."
        />
        <CommandList data-slot="palette-list">
          <CommandEmpty>
            Nothing matches “{trimmed}”. Try a project name.
          </CommandEmpty>
          {trimmed ? (
            <CommandGroup heading={`${results.length} results`}>
              {results.map(({ item }) => {
                const Icon = kindIcon[item.kind]
                return (
                  <CommandItem
                    key={item.path}
                    value={item.path}
                    onSelect={() => go(item)}
                    data-kind={item.kind}
                  >
                    <Icon aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{item.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                    <CommandShortcut data-slot="palette-meta">
                      {searchKindLabel[item.kind]}
                      {item.date ? ` · ${yearOf(item.date)}` : ""}
                    </CommandShortcut>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ) : (
            <>
              <CommandGroup heading="Go to">
                {pages.map((page) => (
                  <CommandItem
                    key={page.path}
                    value={`page ${page.label}`}
                    onSelect={() => go(page)}
                  >
                    <ArrowUpRight aria-hidden="true" />
                    {page.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Actions">
                <CommandItem
                  value="action copy email"
                  onSelect={() => {
                    close()
                    void copy(profile.email, "Email copied")
                  }}
                >
                  <AtSign aria-hidden="true" />
                  Copy email address
                  <CommandShortcut>{profile.email}</CommandShortcut>
                </CommandItem>
                <CommandItem
                  value="action copy link"
                  onSelect={() => {
                    close()
                    void copy(window.location.href, "Link copied")
                  }}
                >
                  <Link2 aria-hidden="true" />
                  Copy link to this page
                </CommandItem>
                <CommandItem
                  value="action theme"
                  onSelect={() => {
                    close()
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }}
                >
                  {resolvedTheme === "dark" ? (
                    <Sun aria-hidden="true" />
                  ) : (
                    <Moon aria-hidden="true" />
                  )}
                  Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
                </CommandItem>
                <CommandItem
                  value="action github"
                  onSelect={() => go({ path: profile.links.github })}
                >
                  <GitPullRequest aria-hidden="true" />
                  Open GitHub profile
                </CommandItem>
                <CommandItem
                  value="action rss"
                  onSelect={() => {
                    close()
                    window.location.assign("/index.xml")
                  }}
                >
                  <Rss aria-hidden="true" />
                  RSS feed
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
