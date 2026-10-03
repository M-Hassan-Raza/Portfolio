import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import slugify from "@sindresorhus/slugify"
import { bodySlug } from "./body-slug"

/**
 * Splits the built documents so a page only downloads what it shows:
 *
 * - `documents.js`: every document without its body, source or search text.
 *   Small enough for the main bundle; lists, cards and navigation use it.
 * - `bodies/<slug>.js`: one ES module per document body and its headings, so
 *   the bundler gives each its own chunk and a page loads only its own.
 * - `text.js`: plain text per path, for search. Loaded when search is used.
 * - `topic-slugs.js`: URL slug per tag and category label, so the app links
 *   topics without shipping a transliteration table.
 *
 * Runs after every content build (the CLI and the Vite watcher alike).
 */
const outputDirectory = join(".content-collections", "split")
const bodiesDirectory = join(outputDirectory, "bodies")

type BuiltDocument = {
  path: string
  mdx: string
  content: string
  text: string
  headings: readonly { title: string; id: string; depth: number }[]
  tags: readonly string[]
  categories: readonly string[]
  _meta: unknown
}

/**
 * The compiled MDX is a function body that expects React's runtime as
 * arguments (mdx-bundler's contract). Wrapping it in a real module lets the
 * bundler share React with the page and skips `new Function` at runtime.
 */
function bodyModule({ mdx, headings }: BuiltDocument) {
  return `import * as React from "react"
import * as ReactDOM from "react-dom"
import * as _jsx_runtime from "react/jsx-runtime"

function run(React, ReactDOM, _jsx_runtime) {
${mdx}
}

export default run(React, ReactDOM, _jsx_runtime).default
export const headings = ${JSON.stringify(headings)}
`
}

async function writeIfChanged(file: string, content: string) {
  const current = await readFile(file, "utf8").catch(() => null)
  if (current !== content) await writeFile(file, content)
}

export async function writeContentSplit(documents: readonly BuiltDocument[]) {
  await mkdir(bodiesDirectory, { recursive: true })

  const meta = documents.map(
    ({
      mdx: _mdx,
      content: _content,
      text: _text,
      headings,
      _meta,
      ...rest
    }) => ({
      ...rest,
      // The table of contents itself ships with the body.
      hasToc: headings.some((heading) => heading.depth === 2),
    })
  )
  await writeIfChanged(
    join(outputDirectory, "documents.js"),
    `export const documents = ${JSON.stringify(meta)}\n`
  )
  await writeIfChanged(
    join(outputDirectory, "documents.d.ts"),
    `import type { Document } from "../../src/lib/content/types"\nexport declare const documents: Array<Document>\n`
  )

  const texts = Object.fromEntries(
    documents.map((document) => [document.path, document.text])
  )
  await writeIfChanged(
    join(outputDirectory, "text.js"),
    `export const texts = ${JSON.stringify(texts)}\n`
  )
  await writeIfChanged(
    join(outputDirectory, "text.d.ts"),
    `export declare const texts: Record<string, string>\n`
  )

  const labels = new Set(
    documents.flatMap((document) => [...document.tags, ...document.categories])
  )
  const topicSlugs = Object.fromEntries(
    [...labels].map((label) => [
      label,
      slugify(label, { preserveCharacters: ["+", "."], decamelize: false }),
    ])
  )
  await writeIfChanged(
    join(outputDirectory, "topic-slugs.js"),
    `export const topicSlugs = ${JSON.stringify(topicSlugs)}\n`
  )
  await writeIfChanged(
    join(outputDirectory, "topic-slugs.d.ts"),
    `export declare const topicSlugs: Record<string, string>\n`
  )

  const wanted = new Set<string>()
  for (const document of documents) {
    const slug = bodySlug(document.path)
    if (wanted.has(`${slug}.js`))
      throw new Error(`Two documents share the body module ${slug}`)
    wanted.add(`${slug}.js`)
    await writeIfChanged(
      join(bodiesDirectory, `${slug}.js`),
      bodyModule(document)
    )
  }
  // Drop bodies of documents that were deleted or unpublished.
  for (const file of await readdir(bodiesDirectory))
    if (!wanted.has(file)) await rm(join(bodiesDirectory, file))
}

/**
 * `oss-stats.js`: the two open-source numbers most pages quote, so they don't
 * pull in every pull request (the full list is for /open-source/ and search).
 */
export async function writeOpenSourceStats(openSource: {
  merged: number
  projects: readonly unknown[]
}) {
  await mkdir(outputDirectory, { recursive: true })
  const stats = {
    merged: openSource.merged,
    projects: openSource.projects.length,
  }
  await writeIfChanged(
    join(outputDirectory, "oss-stats.js"),
    `export const ossStats = ${JSON.stringify(stats)}\n`
  )
  await writeIfChanged(
    join(outputDirectory, "oss-stats.d.ts"),
    `export declare const ossStats: { merged: number; projects: number }\n`
  )
}
