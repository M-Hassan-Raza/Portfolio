import { PillButton } from "@/components/studio/pill"
import {
  defaultPreferences,
  setPreferences,
  textSizes,
  toggleCopy,
  togglePreference,
  usePreferences,
} from "@/lib/preferences"
import type { TextSize, Toggle } from "@/lib/preferences"
import { cn } from "@/lib/utils"
import { PanelDialog } from "./overlays"

const sizeLabels: Record<TextSize, { label: string; glyph: string }> = {
  default: { label: "Default text size", glyph: "text-sm" },
  large: { label: "Large text", glyph: "text-lg" },
  larger: { label: "Larger text", glyph: "text-2xl" },
}

const toggles = Object.keys(toggleCopy) as Toggle[]

/** Text size, motion, contrast, spacing and font, saved in this browser. */
export function ReadingSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const preferences = usePreferences()
  const changed = (
    Object.keys(defaultPreferences) as (keyof typeof preferences)[]
  ).some((key) => preferences[key] !== defaultPreferences[key])

  return (
    <PanelDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reading settings"
      description="Saved in this browser. Your system settings for motion and contrast still apply on top."
      className="sm:max-w-lg"
    >
      <section className="flex items-center justify-between gap-4">
        <h3 id="text-size-label" className="font-semibold">
          Text size
        </h3>
        <div
          role="group"
          aria-labelledby="text-size-label"
          className="flex items-center gap-1 rounded-full border-2 border-ink p-1"
        >
          {textSizes.map((size) => (
            <button
              key={size}
              type="button"
              aria-label={sizeLabels[size].label}
              aria-pressed={preferences.textSize === size}
              onClick={() => setPreferences({ textSize: size })}
              className={cn(
                "pressable-flat grid size-10 cursor-pointer place-items-center rounded-full leading-none font-bold text-ink hover:bg-paper-sunk aria-pressed:bg-ink aria-pressed:text-paper",
                sizeLabels[size].glyph
              )}
            >
              A
            </button>
          ))}
        </div>
      </section>
      <ul className="flex flex-col border-t-2 border-ink">
        {toggles.map((key) => (
          <li key={key} className="border-b-[1.5px] border-line">
            <PreferenceSwitch
              checked={preferences[key]}
              onChange={() => togglePreference(key)}
              label={toggleCopy[key].label}
              detail={toggleCopy[key].detail}
            />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3">
        <PillButton
          variant="ghost"
          size="sm"
          disabled={!changed}
          onClick={() => setPreferences(defaultPreferences)}
        >
          Reset to defaults
        </PillButton>
        <PillButton size="sm" onClick={() => onOpenChange(false)}>
          Done
        </PillButton>
      </div>
    </PanelDialog>
  )
}

/** The whole row is the switch, so the hit area is the full width. */
function PreferenceSwitch({
  checked,
  onChange,
  label,
  detail,
}: {
  checked: boolean
  onChange: () => void
  label: string
  detail: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="group flex w-full cursor-pointer items-center justify-between gap-6 py-3.5 text-left"
    >
      <span className="flex flex-col gap-0.5">
        <span className="font-semibold">{label}</span>
        <span className="text-sm text-ink-soft">{detail}</span>
      </span>
      <span
        aria-hidden="true"
        className="flex h-7 w-12 shrink-0 items-center rounded-full border-2 border-ink bg-paper p-0.5 transition-colors group-aria-checked:justify-end group-aria-checked:bg-ink"
      >
        <span className="size-5 rounded-full bg-ink group-aria-checked:bg-paper" />
      </span>
    </button>
  )
}
