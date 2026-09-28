import { page, hueForPath } from "@/lib/studio"
import { Link, useRouterState } from "@tanstack/react-router"
import { ArrowUp, Menu, Search, X } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { profile } from "#content"
import type { Hue } from "@/lib/studio"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./system/theme-toggle"
import { useCommandPalette } from "./system/command-palette"
import { MenuSheet, MenuSheetClose } from "./system/overlays"
import { Monogram, PeekCreature } from "./studio/characters"
import { PillAnchor, PillLink } from "./studio/pill"
import { Scribble } from "./studio/scribble"
import { springs } from "./studio/motion"
import { WavyEdge } from "./studio/wavy-edge"

const navItems: { label: string; path: string; hue: Hue }[] = [
  { label: "Work", path: "/projects/", hue: "lilac" },
  { label: "Writing", path: "/blog/", hue: "peach" },
  { label: "Books", path: "/books/", hue: "sky" },
  { label: "Open source", path: "/open-source/", hue: "mint" },
  { label: "About", path: "/about/", hue: "rose" },
]

function useActivePath() {
  return useRouterState({ select: (state) => state.location.pathname })
}

function SearchButton({ className }: { className?: string }) {
  const { setOpen } = useCommandPalette()
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Search the site"
      aria-keyshortcuts="Meta+K"
      className={cn(
        "pressable flex h-9 cursor-pointer items-center gap-2 rounded-full bg-paper-sunk pr-2 pl-3 text-sm font-medium text-ink-soft hover:bg-paper-hover hover:text-ink",
        className
      )}
    >
      <Search aria-hidden="true" className="size-4" strokeWidth={2.2} />
      <kbd className="rounded-full bg-paper-raised px-2 py-0.5 font-sans text-xs font-semibold text-ink-soft">
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
        <div className="flex h-14 items-center justify-between gap-4 rounded-full bg-paper-raised py-2 pr-2 pl-2 shadow-float">
          <Link
            to="/"
            aria-label={`${profile.name}, home`}
            className="group flex items-center gap-3 rounded-full pr-2"
          >
            <Monogram />
            <span className="hidden text-[0.95rem] font-bold tracking-[-0.02em] sm:inline lg:hidden xl:inline">
              Hassan Raza
            </span>
          </Link>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.path)
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      data-hue={item.hue}
                      aria-current={active ? "page" : undefined}
                      className="group relative flex h-10 items-center gap-2 rounded-full px-3.5 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:bg-hue-tint hover:text-ink aria-[current=page]:text-ink"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 rounded-full bg-hue transition-transform duration-300 ease-(--ease-pop) group-hover:scale-150",
                          active && "scale-[1.6]"
                        )}
                      />
                      {item.label}
                      {active && (
                        <Scribble
                          key={pathname}
                          variant="underline"
                          delay={120}
                          className="absolute right-3 -bottom-0.5 left-6 h-2"
                        />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="flex items-center gap-1.5">
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

function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const { setOpen: openPalette } = useCommandPalette()
  const items = [
    ...navItems,
    { label: "How I work", path: "/contact/", hue: "rose" as const },
  ]
  return (
    <MenuSheet
      open={open}
      onOpenChange={setOpen}
      title="Menu"
      description="Pages on this site"
      trigger={
        <button
          type="button"
          aria-label="Open menu"
          className="pressable grid size-9 cursor-pointer place-items-center rounded-full bg-ink text-paper md:hidden"
        >
          <Menu aria-hidden="true" className="size-4" strokeWidth={2.4} />
        </button>
      }
    >
      <div className="flex flex-col gap-8 px-5 pt-5 pb-7">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 rounded-full"
          >
            <Monogram />
            <span className="font-bold tracking-[-0.02em]">Hassan Raza</span>
          </Link>
          <MenuSheetClose
            render={
              <button
                type="button"
                aria-label="Close menu"
                className="pressable grid size-10 cursor-pointer place-items-center rounded-full bg-paper-sunk text-ink"
              />
            }
          >
            <X aria-hidden="true" className="size-4" strokeWidth={2.4} />
          </MenuSheetClose>
        </div>
        <nav aria-label="Mobile">
          <ul className="flex flex-col">
            {items.map((item, index) => (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springs.settle, delay: 0.04 * index + 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={() => setOpen(false)}
                  data-hue={item.hue}
                  aria-current={
                    pathname.startsWith(item.path) ? "page" : undefined
                  }
                  className="flex items-center gap-4 rounded-md px-2 py-2 text-[2.5rem] leading-[1.1] font-bold tracking-[-0.035em] [font-stretch:92%] hover:bg-hue-tint aria-[current=page]:bg-hue-tint"
                >
                  <span
                    aria-hidden="true"
                    className="size-3.5 shrink-0 rounded-full bg-hue"
                  />
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              openPalette(true)
            }}
            className="pressable flex h-11 flex-1 cursor-pointer items-center gap-2 rounded-full bg-paper-sunk px-4 font-medium text-ink-soft"
          >
            <Search aria-hidden="true" className="size-4" />
            Search the site
          </button>
          <ThemeToggle className="size-11" />
        </div>
      </div>
    </MenuSheet>
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
      { label: "Books", path: "/books/" },
      { label: "Open source", path: "/open-source/" },
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

export function SiteFooter() {
  const pathname = useActivePath()
  const hue = hueForPath(pathname)
  return (
    <footer className="relative isolate flex flex-col overflow-clip pt-20 print:hidden">
      <div className="relative frame h-0">
        <PeekCreature className="absolute right-[8%] -bottom-10 w-32 sm:right-[14%] sm:-bottom-12 sm:w-44" />
      </div>
      <WavyEdge className="text-paper-sunk" />
      <div className="flex flex-col gap-16 bg-paper-sunk pt-10">
        <div className="frame grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col items-start gap-5">
            <p className="max-w-xs type-lede text-ink">
              Thanks for scrolling all the way down. The inbox is the fastest
              way to reach me.
            </p>
            <PillAnchor
              href={`mailto:${profile.email}`}
              variant="paper"
              size="sm"
            >
              {profile.email}
            </PillAnchor>
            <div className="flex gap-4 text-sm font-medium text-ink-soft">
              <a className="hover:text-ink" href={profile.links.github}>
                GitHub
              </a>
              <a className="hover:text-ink" href={profile.links.linkedin}>
                LinkedIn
              </a>
              <a className="hover:text-ink" href="/index.xml">
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
              <h2 className="type-label text-ink-faint">{group.title}</h2>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      data-hue={hueForPath(link.path)}
                      className="group inline-flex items-center gap-2 text-[0.95rem] font-medium text-ink hover:text-ink-soft"
                    >
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-hue transition-transform duration-300 ease-(--ease-pop) group-hover:scale-[1.8]"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="frame flex flex-wrap items-center justify-between gap-4 text-sm text-ink-soft">
          <p>
            Made with care in Lahore. Set in Bricolage Grotesque and Fraunces.
          </p>
          <a
            href="#main-content"
            className="group inline-flex items-center gap-1.5 font-medium hover:text-ink"
          >
            Back to top
            <ArrowUp
              aria-hidden="true"
              className="size-4 transition-transform duration-300 ease-(--ease-pop) group-hover:-translate-y-1"
            />
          </a>
        </div>
        <div
          aria-hidden="true"
          data-hue={hue}
          className="frame flex h-[12vw] items-start overflow-clip select-none"
        >
          <span
            className="text-[15.5vw] leading-[0.8] font-extrabold tracking-[-0.055em] whitespace-nowrap text-hue [font-stretch:88%]"
            style={{ fontVariationSettings: '"opsz" 96' }}
          >
            Hassan Raza
          </span>
        </div>
      </div>
    </footer>
  )
}
