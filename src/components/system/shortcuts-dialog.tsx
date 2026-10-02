import { Fragment } from "react"
import { MetaPill } from "@/components/studio/tag"
import { eggs, shortcutGroups, useFoundEggs } from "@/lib/quirks"
import { Keys, PanelDialog } from "./overlays"

const isMac = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.userAgent)

/** The `?` sheet: every shortcut, plus a tally of the ones not on it. */
export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const found = useFoundEggs()
  const names = eggs.filter((egg) => found.includes(egg.id))
  const mac = isMac()

  return (
    <PanelDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Keyboard shortcuts"
      description="They work anywhere on the page, as long as you're not typing in a field."
    >
      <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
        {shortcutGroups.map((group) => (
          <section key={group.title} className="flex flex-col gap-3">
            <h3 className="type-label text-ink-soft">{group.title}</h3>
            <ul className="flex flex-col gap-2.5">
              {group.rows.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-4 text-[0.9375rem]"
                >
                  <span>{row.label}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {row.keys.map((chord, index) => (
                      <Fragment key={chord.join("+")}>
                        {index > 0 && (
                          <span className="text-xs text-ink-faint">or</span>
                        )}
                        <Keys
                          keys={chord.map((key) =>
                            key === "⌘" && !mac ? "Ctrl" : key
                          )}
                        />
                      </Fragment>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <section
        data-block="lemon"
        className="flex flex-col gap-3 rounded-[18px] border-2 border-ink bg-block-tint p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="type-label">Not on this list</h3>
          <span className="type-label text-ink-soft tabular">
            {found.length} of {eggs.length} found
          </span>
        </div>
        {names.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {names.map((egg) => (
              <li key={egg.id}>
                <MetaPill tone="outline">{egg.name}</MetaPill>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[0.9375rem] text-ink-soft">
            Some commands are hidden. Try what you'd type into a terminal, or an
            old cheat code.
          </p>
        )}
      </section>
    </PanelDialog>
  )
}
