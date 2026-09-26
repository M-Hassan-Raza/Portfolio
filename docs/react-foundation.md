# React foundation

Scope: migrate the technical foundation locally. Preserve published content and URLs, static GitHub Pages hosting, metadata, feeds, search, comments, and analytics. Keep the presentation simple for a separate Claude design pass.

## Ownership

- `content/`: authored MDX and metadata. Content Collections validates the canonical schema and generates inferred TypeScript types.
- `data/`: profile facts, generated open-source records, and curated highlights. Pages consume these owners directly.
- `src/lib/content/`: shared published-content selection, paths, taxonomies, and ordering.
- `src/routes/`: TanStack Router loaders, metadata, URL resolution, and redirects.
- `src/components/`: presentation only; MDX components expose small explicit props.
- `scripts/`: static feed/output generation and artifact verification, using the same content contracts.
- Base UI based shadcn: accessible controls added only when used.

Use framework and library contracts. Do not add Hugo syntax interpreters, compatibility schemas, duplicate page payloads, unchecked casts, or per-screen content mappers. Convert authored content once and remove the old runtime when the new build is verified.

## Sequence

1. Capture fresh Hugo public paths and establish the Start build.
2. Define content/data schemas and migrate authored syntax to MDX.
3. Add document rendering, collections, profile, resume, and open-source views.
4. Preserve taxonomy URLs, old aliases, feeds, sitemap, and search.
5. Add theme, comments, and analytics integrations.
6. Verify static artifacts and browser behavior; retire Hugo; document the design handoff.

Each coherent slice gets a small commit after its relevant checks pass. No pushing or deployment.

## Acceptance

- Strict TypeScript, formatting/lint, authored-copy check, production build.
- All paths captured in `tests/fixtures/hugo-paths.json` remain served or redirected.
- Published pages contain their content and metadata in static HTML.
- Direct loads, client navigation, missing paths, search, light/dark theme, and mobile layout work.
- The static artifact needs no running server and contains no private source material.
