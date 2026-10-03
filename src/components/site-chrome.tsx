import { page, blockForSection } from "@/lib/studio"
import { Link, useRouterState } from "@tanstack/react-router"
import { ArrowUp, BookOpenText, Keyboard, Menu, Search } from "lucide-react"
import { Suspense, lazy, useState } from "react"
import { profile } from "#content"
import type { Surface } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./system/theme-toggle"
import {
  preloadCommandPalette,
  useCommandPalette,
} from "./system/command-palette"
import { useQuirks } from "./system/quirks"
import { PillAnchor, PillLink } from "./studio/pill"

export const navItems: { label: string; path: string; block: Surface }[] = [
  { label: "Work", path: "/projects/", block: "tomato" },
  { label: "Writing", path: "/blog/", block: "ultramarine" },
  { label: "Open source", path: "/open-source/", block: "grass" },
  { label: "Books", path: "/books/", block: "lemon" },
  { label: "About", path: "/about/", block: "violet" },
]

function useActivePath() {
  return useRouterState({ select: (state) => state.location.pathname })
}

export function Wordmark() {
  return (
    <span
      className="text-[1.3rem] leading-none font-extrabold tracking-[-0.045em] [font-stretch:90%]"
      style={{ fontVariationSettings: '"opsz" 48' }}
    >
      Hassan Raza
    </span>
  )
}

function SearchButton({ className }: { className?: string }) {
  const { setOpen } = useCommandPalette()
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      onPointerEnter={preloadCommandPalette}
      onFocus={preloadCommandPalette}
      aria-label="Search the site"
      aria-keyshortcuts="Meta+K"
      className={cn(
        "pressable-flat flex h-9 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-ink pr-1.5 pl-3 text-sm font-semibold text-ink hover:bg-paper-sunk",
        className
      )}
    >
      <Search aria-hidden="true" className="size-4" strokeWidth={2.4} />
      <kbd className="rounded-full bg-ink px-2 py-0.5 font-sans text-xs font-bold text-paper">
        ⌘K
      </kbd>
    </button>
  )
}

export function SiteHeader() {
  const pathname = useActivePath()
  return (
    <header className="sticky top-0 z-sticky h-0 print:hidden">
      <div className="frame pt-3">
        <div className="flex h-15 items-center justify-between gap-4 rounded-full border-2 border-ink bg-paper-raised py-2 pr-2 pl-5 text-ink shadow-rest">
          <Link
            to="/"
            aria-label={`${profile.name}, home`}
            className="rounded-full"
          >
            <Wordmark />
          </Link>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.path)
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      data-block={item.block}
                      aria-current={active ? "page" : undefined}
                      className="flex h-10 items-center rounded-full border-2 border-transparent px-3.5 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink aria-[current=page]:border-ink aria-[current=page]:bg-block aria-[current=page]:text-on-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <SearchButton className="hidden sm:flex" />
            <ThemeToggle />
            <PillLink
              to={page("/contact/")}
              size="sm"
              className="hidden lg:inline-flex"
            >
              Say hello
            </PillLink>
            <MobileMenu pathname={pathname} />
          </div>
        </div>
      </div>
    </header>
  )
}

/*
 * The menu sheet (and the dialog machinery behind it) is its own chunk, loaded
 * on the first tap; the button that opens it is plain.
 */
const loadMenuSheet = () => import("./mobile-menu")
const MobileMenuSheet = lazy(loadMenuSheet)

function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  if (open && !mounted) setMounted(true)
  const preload = () => void loadMenuSheet().catch(() => undefined)
  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        onPointerDown={preload}
        onFocus={preload}
        className="pressable-flat grid size-10 cursor-pointer place-items-center rounded-full bg-ink text-paper md:hidden"
      >
        <Menu aria-hidden="true" className="size-4" strokeWidth={2.6} />
      </button>
      {mounted && (
        <Suspense fallback={null}>
          <MobileMenuSheet
            open={open}
            onOpenChange={setOpen}
            pathname={pathname}
          />
        </Suspense>
      )}
    </>
  )
}

const footerGroups: {
  title: string
  links: { label: string; path: string }[]
}[] = [
  {
    title: "Look around",
    links: [
      { label: "Work", path: "/projects/" },
      { label: "Writing", path: "/blog/" },
      { label: "Open source", path: "/open-source/" },
      { label: "Books", path: "/books/" },
    ],
  },
  {
    title: "The person",
    links: [
      { label: "About", path: "/about/" },
      { label: "How I work", path: "/contact/" },
      { label: "Teaching", path: "/teaching/" },
      { label: "Resume", path: "/resume/" },
    ],
  },
  {
    title: "Odds and ends",
    links: [
      { label: "Search", path: "/search/" },
      { label: "Archive", path: "/archives/" },
      { label: "Tags", path: "/tags/" },
      { label: "Privacy", path: "/privacy-policy/" },
      { label: "DMCA", path: "/dmca/" },
    ],
  },
]

/** Reading settings, the shortcut sheet and the way back up. */
function FooterTools() {
  const { openReadingSettings, openShortcuts } = useQuirks()
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-semibold">
      <button
        type="button"
        onClick={openReadingSettings}
        className="inline-flex cursor-pointer items-center gap-1.5 hover:underline"
      >
        <BookOpenText aria-hidden="true" className="size-4" />
        Reading settings
      </button>
      <button
        type="button"
        onClick={openShortcuts}
        aria-keyshortcuts="?"
        className="hidden cursor-pointer items-center gap-1.5 hover:underline md:inline-flex"
      >
        <Keyboard aria-hidden="true" className="size-4" />
        Shortcuts
      </button>
      <a
        href="#main-content"
        className="group inline-flex items-center gap-1.5 hover:underline"
      >
        Back to top
        <ArrowUp
          aria-hidden="true"
          className="size-4 transition-transform duration-300 ease-(--ease-pop) group-hover:-translate-y-1"
        />
      </a>
    </div>
  )
}

export function SiteFooter() {
  const pathname = useActivePath()
  const section = blockForSection(pathname)
  return (
    <footer
      data-block={section === "ink" ? "tomato" : section}
      className="print-scope flex flex-col gap-14 border-t-2 border-footer-rule bg-ink-fixed pt-16 pb-12 text-paper-fixed print:hidden"
    >
      <div className="frame grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="flex flex-col items-start gap-5">
          <p className="max-w-xs type-h3 text-[1.6rem]">
            Thanks for scrolling all the way down. The inbox is the fastest way
            to reach me.
          </p>
          <PillAnchor
            href={`mailto:${profile.email}`}
            variant="block"
            size="md"
          >
            {profile.email}
          </PillAnchor>
          <div className="flex gap-4 text-sm font-semibold">
            <a className="hover:underline" href={profile.links.github}>
              GitHub
            </a>
            <a className="hover:underline" href={profile.links.linkedin}>
              LinkedIn
            </a>
            <a className="hover:underline" href="/index.xml">
              RSS
            </a>
          </div>
        </div>
        {footerGroups.map((group) => (
          <nav
            key={group.title}
            aria-label={group.title}
            className="flex flex-col gap-4"
          >
            <h2 className="type-label text-paper-fixed">{group.title}</h2>
            <ul className="flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[1.05rem] font-semibold underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="frame flex flex-wrap items-center justify-between gap-4 text-sm">
        <p>Made in Lahore. Set in Bricolage Grotesque and Fraunces.</p>
        <FooterTools />
      </div>
    </footer>
  )
}
