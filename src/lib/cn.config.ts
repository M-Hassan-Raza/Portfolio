/**
 * Extensions to `cn`'s Tailwind class groups. `pnpm cn:build` compiles them
 * with the defaults into src/lib/cn-tables.gen.js, so the browser gets ready
 * tables instead of compiling them at startup.
 *
 * Stacking tiers are defined in src/styles.css (`--z-index-*`) and registered
 * as a class group so `cn("z-modal", "z-popover")` resolves to the last tier.
 * Semantic color tokens need no registration: `cn` already treats any
 * `bg-*` / `text-*` / `ring-*` / `border-*` word as a color.
 */
export default {
  extend: {
    classGroups: {
      z: [
        {
          z: [
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
          ],
        },
      ],
    },
  },
}
