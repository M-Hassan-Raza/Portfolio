import { createCn } from "cn/config"

/**
 * Stacking tiers defined in src/styles.css (`--z-index-*`). Registered as a
 * class group so `cn("z-modal", "z-popover")` resolves to the last tier.
 * Semantic color tokens need no registration: `cn` already treats any
 * `bg-*` / `text-*` / `ring-*` / `border-*` word as a color.
 */
const zTiers = [
  "base",
  "raised",
  "sticky",
  "dropdown",
  "overlay",
  "modal",
  "popover",
  "toast",
  "tooltip",
  "skip-link",
  "toast-stack",
]

export const cn = createCn({
  extend: { classGroups: { z: [{ z: zTiers }] } },
})
