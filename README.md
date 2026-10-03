# mhassan.dev

Portfolio built with TanStack Start, React, TypeScript, and Base UI based shadcn controls. TanStack Router owns route loaders, metadata, navigation, and search parameters. The production artifact is static HTML for GitHub Pages.

## Run it

Use Node 24 or newer and the pnpm version in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm verify
pnpm preview
```

`verify` validates content, types, lint, formatting, copy, and production artifacts. `preview` serves `dist/client` on port 3000 without an application server. CI verifies pull requests and publishes this directory on pushes to `main`.

## Ownership

| Path                                  | Owner                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| `content/`                            | Authored MDX, canonical paths, aliases, and metadata.                                      |
| `src/lib/content/schema.ts`           | Strict content and data contracts; generated types are inferred from these schemas.        |
| `content-collections.ts`              | Validation, MDX compilation, headings, reading time, and exclusion of unpublished content. |
| `src/lib/content/split.ts`            | Splits built content: metadata for the app, one chunk per body, search text on demand.     |
| `data/profile.yaml`                   | Shared profile facts for home, About, Contact, and Resume.                                 |
| `data/oss.json`                       | Generated open-source records; refresh with `scripts/oss.sh` and authenticated `gh`.       |
| `data/oss_highlights.yaml`            | Curated references into the open-source records.                                           |
| `src/lib/content/`                    | Published catalog, ordering, taxonomy paths, redirects, and search projection.             |
| `src/routes/`                         | TanStack route contracts and URL state.                                                    |
| `src/components/`                     | Page presentation and accessible controls.                                                 |
| `src/styles.css`                      | Theme tokens, typography, and shared styles.                                               |
| `assets/ascii-covers/`                | Cover art loaded as separate modules.                                                      |
| `static/`                             | Public files copied to the artifact.                                                       |
| `scripts/static-output.tsx`           | Feeds, sitemap, aliases, search index, standalone 404, and per-page chunk preloads.        |
| `tests/fixtures/published-paths.json` | Published URL contract: 379 paths.                                                         |
| `private/`                            | Ignored local source material; never published.                                            |

Keep the schemas and profile facts canonical. Use TanStack packages for needs they own; add dependencies when a feature needs them. Add shadcn controls using the Base UI configuration in `components.json`.

## Performance budget

The site has to work on ten-year-old laptops and 3G, so the main bundle carries only what every page renders. Keep it that way:

- Page bodies and page views are their own chunks. Route loaders (and `src/client.tsx`, before hydration) load them, and the build preloads them in each page's HTML.
- Anything opened on demand loads on demand: the command palette, the easter eggs (`src/components/quirks/stage.tsx`, the only place Motion is used), dialogs, the mobile menu and toasts.
- Entrances are CSS, started by the inline boot script (`src/lib/boot.ts`) before the app loads. Never hide prerendered content until hydration.
- `data-perf="low"` marks weak machines and Save-Data; it drops repaint-heavy transitions, backdrop blur and page cross-fades.

## Visual redesign

The presentation is a technical foundation for a separate Claude design pass. See `docs/react-foundation.md` for preserved contracts and the handoff. Change layouts, typography, spacing, color, and components while keeping content, public URLs, metadata, and static hosting intact.

Local verification does not establish hosted CI, deployment, analytics delivery, or authenticated comment posting.
