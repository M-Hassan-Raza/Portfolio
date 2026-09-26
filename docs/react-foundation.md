# React foundation

Technical foundation: TanStack Start, React, TypeScript, and Base UI based shadcn. Preserve published content and URLs, static GitHub Pages hosting, metadata, feeds, search, comments, and analytics. Keep the presentation simple for a separate Claude design pass.

## Ownership

- `content/`: authored MDX and metadata. Content Collections validates the canonical schema and generates inferred TypeScript types.
- `data/`: profile facts, generated open-source records, and curated highlights. Pages consume these owners directly.
- `src/lib/content/`: shared published-content selection, paths, taxonomies, and ordering.
- `src/routes/`: TanStack Router loaders, metadata, URL resolution, and redirects.
- `src/components/`: presentation only; MDX components expose small explicit props.
- `scripts/`: static feed/output generation and artifact verification, using the same content contracts.
- Base UI based shadcn: accessible controls added only when used.

Use framework and library contracts. Do not add compatibility schemas, duplicate page payloads, unchecked casts, or per-screen content mappers.

Each coherent slice gets a small commit after its relevant checks pass. No pushing or deployment.

## Acceptance

- Strict TypeScript, formatting/lint, authored-copy check, production build.
- All paths captured in `tests/fixtures/published-paths.json` remain served or redirected.
- Published pages contain their content and metadata in static HTML.
- Direct loads, client navigation, missing paths, search, light/dark theme, and mobile layout work.
- The static artifact needs no running server and contains no private source material.

## Claude handoff

Redesign the complete visual direction: home, collections, articles, case studies, books, About, Resume, Open source, search, and shared navigation. Establish a coherent visual system, then implement it in small commits. Use the existing Base UI based shadcn configuration for controls. Prefer applicable TanStack packages for interaction and state ownership. Keep dependencies purposeful.

Preserve canonical schemas, profile facts, authored copy, paths, aliases, metadata, feeds, comments mapping, and static output. Presentation can change freely. Add no compatibility layers, duplicate data models, unchecked casts, or speculative abstractions. Keep behavior in its current owner and compose small presentation components.

Run `pnpm verify` and inspect desktop/mobile pages, keyboard navigation, both themes, search reloads, direct article loads, and the standalone 404. Check browser errors after hydration. Avoid introducing horizontal overflow or inaccessible controls. Keep all work local.

## Local evidence

The migrated artifact preserves all 379 captured paths, including 115 redirects. Verification checks 151 canonical pages, internal links/assets, metadata, structured data, authored HTML, and the standalone 404. Strict TypeScript, lint, formatting, copy checks, frozen installation, and peer checks pass.

Browser checks cover client navigation, bookmarked search state, persisted theme, mobile reading and book layouts, code copying, legacy redirects, taxonomy URLs, and static missing pages. Giscus loads its widget; an uncreated discussion returns the provider's expected “Discussion not found” response. Comment submission and production analytics delivery remain unverified. CI and deployment have not run for this local branch. The Claude redesign remains a separate pass.
