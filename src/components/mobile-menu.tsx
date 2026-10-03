import { Link } from "@tanstack/react-router"
import { ArrowUpRight, Search, X } from "lucide-react"
import type { CSSProperties } from "react"
import { Wordmark, navItems } from "./site-chrome"
import {
  preloadCommandPalette,
  useCommandPalette,
} from "./system/command-palette"
import { MenuSheet, MenuSheetClose } from "./system/menu-sheet"
import { ThemeToggle } from "./system/theme-toggle"

const items = [
  ...navItems,
  { label: "How I work", path: "/contact/", block: "pink" as const },
]

/** The full-height menu on small screens. Loaded on first open (site-chrome.tsx). */
export default function MobileMenuSheet({
  open,
  onOpenChange,
  pathname,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathname: string
}) {
  const { setOpen: openPalette } = useCommandPalette()
  const close = () => onOpenChange(false)
  return (
    <MenuSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Menu"
      description="Pages on this site"
    >
      <div className="flex flex-col gap-6 px-4 pt-4 pb-6">
        <div className="flex h-12 items-center justify-between pl-2">
          <Link to="/" onClick={close} className="rounded-full">
            <Wordmark />
          </Link>
          <MenuSheetClose
            render={
              <button
                type="button"
                aria-label="Close menu"
                className="pressable-flat grid size-11 cursor-pointer place-items-center rounded-full border-2 border-ink text-ink"
              />
            }
          >
            <X aria-hidden="true" className="size-4" strokeWidth={2.6} />
          </MenuSheetClose>
        </div>
        <nav aria-label="Mobile">
          <ul className="flex flex-col border-t-2 border-ink">
            {items.map((item, index) => (
              <li
                key={item.path}
                data-block={item.block}
                style={{ "--i": index } as CSSProperties}
                className="menu-drop border-b-2 border-ink"
              >
                <Link
                  to={item.path}
                  onClick={close}
                  aria-current={
                    pathname.startsWith(item.path) ? "page" : undefined
                  }
                  className="wipe flex items-center justify-between px-2 py-3 text-[2.4rem] leading-none font-extrabold tracking-[-0.045em] [font-stretch:88%] aria-[current=page]:bg-block aria-[current=page]:text-on-block"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-6"
                    strokeWidth={2.4}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              close()
              openPalette(true)
            }}
            onPointerDown={preloadCommandPalette}
            onFocus={preloadCommandPalette}
            className="pressable flex h-12 flex-1 cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-paper-raised px-4 font-semibold text-ink"
          >
            <Search aria-hidden="true" className="size-4" strokeWidth={2.4} />
            Search the site
          </button>
          <ThemeToggle className="size-12" />
        </div>
      </div>
    </MenuSheet>
  )
}
