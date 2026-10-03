import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { join, dirname } from "node:path"
import { renderToStaticMarkup } from "react-dom/server"
import { Feed } from "feed"
import { SitemapStream, streamToPromise } from "sitemap"
import { profile } from "#content"
import NotFoundBody from "#content/bodies/404"
import type { Document } from "../src/lib/content/types"
import { documents, requireDocument } from "../src/lib/content/catalog"
import { topics } from "../src/lib/content/taxonomies"
import { redirects } from "../src/lib/content/redirects"
import { searchEntries } from "../src/lib/content/search"
import { site } from "../src/lib/site"
import { bodySlug } from "../src/lib/content/body-slug"
import { viewOf } from "../src/components/content/view-names"
import { pageChunksFile, pageChunksRecord } from "../vite-plugin-page-chunks"
import type { PageChunks } from "../vite-plugin-page-chunks"
import { NotFoundView } from "../src/components/views/not-found"

const output = "dist/client"
const artifactPath = (path: string) =>
  join(output, path.endsWith("/") ? `${path}index.html` : path)
async function write(path: string, content: string | Buffer) {
  const file = artifactPath(path)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, content)
}

/*
 * A page's body and its view are chunks of their own, and the client entry
 * waits for both before hydrating. Preloading them in the HTML downloads them
 * alongside the app instead of after it.
 */
const pageChunks = JSON.parse(
  await readFile(join(output, pageChunksFile), "utf8")
) as PageChunks
for (const document of documents.filter(
  (entry) => entry.kind !== "not-found"
)) {
  const view = viewOf(document)
  const wanted = [
    ...(document.hasBody
      ? (pageChunks.bodies[bodySlug(document.path)] ?? [])
      : []),
    ...(view ? (pageChunks.views[view] ?? []) : []),
  ]
  if (document.hasBody && !pageChunks.bodies[bodySlug(document.path)])
    throw new Error(`No body chunk for ${document.path}`)
  if (view && !pageChunks.views[view])
    throw new Error(`No view chunk for ${document.path} (${view})`)
  const file = artifactPath(document.path)
  const html = await readFile(file, "utf8")
  if (!html.includes("</head>")) throw new Error(`No <head> in ${file}`)
  const links = [...new Set(wanted)]
    .filter((href) => !html.includes(`href="${href}"`))
    .map((href) => `<link rel="modulepreload" href="${href}"/>`)
    .join("")
  await writeFile(file, html.replace("</head>", `${links}</head>`))
}
// Kept outside the published folder for scripts/verify-artifacts.ts.
await writeFile(pageChunksRecord, JSON.stringify(pageChunks))
await rm(join(output, dirname(pageChunksFile)), { recursive: true })
function feedFor(path: string, title: string) {
  return new Feed({
    title,
    id: `${site.url}${path}`,
    link: `${site.url}${path}`,
    description: site.description,
    language: site.language,
    image: `${site.url}${site.socialImage}`,
    copyright: profile.name,
    author: { name: profile.name, link: `${site.url}/` },
  })
}
async function writeFeed(
  path: string,
  title: string,
  entries: readonly Document[]
) {
  const feed = feedFor(path, title)
  for (const entry of [...entries]
    .filter((item) => item.publishedAt)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    .slice(0, 30)) {
    if (!entry.publishedAt) continue
    feed.addItem({
      title: entry.title,
      id: `${site.url}${entry.path}`,
      link: `${site.url}${entry.path}`,
      description: entry.description,
      date: new Date(entry.publishedAt),
      published: new Date(entry.publishedAt),
    })
  }
  await write(`${path}index.xml`, feed.rss2())
}
await writeFeed("/", profile.name, documents)
for (const document of documents.filter((entry) => entry.feed)) {
  await writeFeed(
    document.path,
    document.title,
    documents.filter(
      (entry) =>
        entry.path !== document.path && entry.path.startsWith(document.path)
    )
  )
}
for (const topic of topics)
  await writeFeed(topic.path, topic.label, topic.entries)
for (const kind of ["tags", "categories"] as const) {
  const feed = feedFor(`/${kind}/`, kind === "tags" ? "Tags" : "Categories")
  for (const topic of topics
    .filter((candidate) => candidate.kind === kind)
    .slice(0, 30)) {
    const dates = topic.entries
      .flatMap((entry) => (entry.publishedAt ? [entry.publishedAt] : []))
      .sort()
      .reverse()
    const date = dates[0]
    if (date)
      feed.addItem({
        title: topic.label,
        id: `${site.url}${topic.path}`,
        link: `${site.url}${topic.path}`,
        description: `Writing and work about ${topic.label}.`,
        date: new Date(date),
      })
  }
  await write(`/${kind}/index.xml`, feed.rss2())
}
for (const [path, target] of redirects) {
  const url = `${site.url}${target}`
  await write(
    path,
    `<!doctype html>${renderToStaticMarkup(
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <title>Page moved</title>
          <link rel="canonical" href={url} />
          <meta httpEquiv="refresh" content={`0; url=${target}`} />
        </head>
        <body>
          <p>
            This page has moved to <a href={target}>{target}</a>.
          </p>
        </body>
      </html>
    )}`
  )
}
const missing = requireDocument("/404.html")
const stylesheet = /<link rel="stylesheet" href="([^"]+)"/.exec(
  await readFile(join(output, "index.html"), "utf8")
)?.[1]
await write(
  "/404.html",
  `<!doctype html>${renderToStaticMarkup(
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>{`${missing.title} | ${profile.name}`}</title>
        {stylesheet && <link rel="stylesheet" href={stylesheet} />}
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <main className="flex min-h-dvh flex-col">
          <NotFoundView
            body={
              <div className="prose-site prose max-w-none">
                <NotFoundBody />
              </div>
            }
          />
        </main>
      </body>
    </html>
  )}`
)
const sitemap = new SitemapStream({ hostname: site.url })
const sitemapResult = streamToPromise(sitemap)
for (const document of documents.filter((entry) => entry.kind !== "not-found"))
  sitemap.write({
    url: document.path,
    lastmod: document.updatedAt ?? document.publishedAt,
  })
for (const topic of topics) sitemap.write({ url: topic.path })
for (const kind of ["tags", "categories"]) sitemap.write({ url: `/${kind}/` })
sitemap.end()
await write("/sitemap.xml", await sitemapResult)
await write(
  "/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`
)
await write("/index.json", `${JSON.stringify(searchEntries)}\n`)
await write("/CNAME", `${new URL(site.url).hostname}\n`)
await write("/.nojekyll", "")
console.log(
  `Generated ${redirects.size} redirects, feeds, sitemap, search index, and standalone 404`
)
