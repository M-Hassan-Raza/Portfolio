---
name: ascii-cover
description: Generate ASCII portfolio covers and connect them to MDX.
---

# ASCII cover pipeline

The portfolio loads halftone ASCII through the React `AsciiCover` component. Use this pipeline when adding or replacing a cover.

## Tools

- `magick` (ImageMagick) — crop / resize source images
- `jp2a` (1.3+) — convert raster to ASCII

Both are already installed via Homebrew.

## Variants and exact dimensions

`src/components/content/ascii-cover.tsx` sizes text from the asset's column count using container units. Shared styling lives in `src/styles.css`.

| Variant | Use for | Aspect | jp2a args | Output rows |
|---|---|---|---|---|
| Wide | Blog covers, project covers, home hero panels | 16:10 | `--width=280 --height=88` | 88 |
| Portrait | Book covers | 2:3 | `--width=280 --height=210` | 210 |
| Square | Profile portrait | 1:1 | `--width=280 --height=140` | 140 |

`jp2a`'s default mapping (bright pixel → dense character) is correct for the dark site theme. Do **not** pass `--invert` or `--background=light`.

## Pipeline

1. **Pick a source image.** Usually the user has dropped one or more candidates in `~/Downloads/`. Look there first; ask only if nothing matches the topic.
2. **Crop to the target aspect** so jp2a doesn't letterbox or stretch:
   ```bash
   magick "<source>" -resize "1600x>" -gravity center \
     -extent <W>x<H> "/tmp/<key>.jpg"
   ```
   Use `1600x1000` for 16:10, `1000x1500` for 2:3, `1200x1200` for 1:1. The `^` resize flag with `-extent` does center-crop fill — pick whichever shape fits the photo's subject.
3. **Render ASCII** into the assets directory:
   ```bash
   jp2a --width=280 --height=<rows> "/tmp/<key>.jpg" \
     > assets/ascii-covers/<key>.txt
   ```
4. **Wire it into the page.** Two integration points exist depending on context:

   **Front-matter cover** (blog posts, project pages, book section indexes):
   ```yaml
   cover:
     ascii: "<key>"
     alt: "Plain-language description"
   ```
   Document covers render through `DocumentView`; the homepage reads its cover reference from home metadata.

   **Inline MDX component** (for example, individual books):
   ```mdx
   <AsciiCover asset="<key>" alt="Alt text" variant="portrait" />
   ```
   Supported variants are `portrait`, `landscape` (default), and `screen`.

5. **Verify.** Run `pnpm verify`, then inspect the affected page with `pnpm preview` on port 3000 at desktop and mobile widths.

## Where to put new keys

- `assets/ascii-covers/<key>.txt` — ASCII output
- One reference in either frontmatter or an MDX component

Don't add the source image to the repo — only the `.txt` ships.

## Key naming

Keep keys short and stable: book titles → `brotherskaramazov`, `sole`, projects → `<slug>-cover`, blog buckets → `ai`, `engineering`, `craft`, profile → `profile`. If unsure, mirror what's already in `assets/ascii-covers/`.

## When the result looks wrong

- **Photo looks washed out / no detail at thumbnail size**: the source has narrow dynamic range. Pre-process with `magick "<source>" -auto-level -contrast` before jp2a, or pick a different photo. Don't fight it with `--invert`.
- **ASCII overflows its card or has gaps**: the row count doesn't match the variant. Re-render with the table above.
- **Summary contains raw ASCII characters**: keep cover assets out of authored prose and use the page's explicit description.

## Reference: known-good covers

- 16:10 blog: `assets/ascii-covers/post-war-stories.txt` (88 rows, 280 cols)
- 2:3 book: `assets/ascii-covers/sole.txt` (210 rows)
- 1:1 profile: `assets/ascii-covers/profile.txt` (140 rows)
