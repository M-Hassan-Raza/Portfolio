import { Kbd, KbdGroup } from "@/components/ui/kbd"

/** Keycaps for one chord, pressed in order: ["g", "h"]. */
export function Keys({
  keys,
  className,
}: {
  keys: string[]
  className?: string
}) {
  return (
    <KbdGroup className={className}>
      {keys.map((key, index) => (
        <Kbd
          key={`${key}-${index}`}
          className="h-6 min-w-6 rounded-[7px] border-[1.5px] border-ink bg-paper px-1.5 text-[0.8125rem] font-bold text-ink shadow-press"
        >
          {key}
        </Kbd>
      ))}
    </KbdGroup>
  )
}
