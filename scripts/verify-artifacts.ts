import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { load } from "cheerio"
import { z } from "zod"
import { documents } from "../src/lib/content/catalog"
import { topics } from "../src/lib/content/taxonomies"
import { redirects } from "../src/lib/content/redirects"
import { searchEntries } from "../src/lib/content/search"
import { mainNavigation, footerNavigation, site } from "../src/lib/site"

const output = "dist/client"
const artifactPath = (path: string) =>
  join(output, path.endsWith("/") ? `${path}index.html` : path)
const requiredPaths = z
  .array(z.string())
  .parse(JSON.parse(readFileSync("tests/fixtures/hugo-paths.json", "utf8")))
for (const path of requiredPaths)
  assert(existsSync(artifactPath(path)), `Missing published URL: ${path}`)
for (const item of [...mainNavigation, ...footerNavigation])
  assert(
    documents.some((document) => document.path === item.path),
    `Missing navigation target: ${item.path}`
  )
const canonicalPaths = [
  ...documents
    .filter((document) => document.kind !== "not-found")
    .map((document) => document.path),
  ...topics.map((topic) => topic.path),
  "/tags/",
  "/categories/",
]
for (const path of canonicalPaths) {
  const $ = load(readFileSync(artifactPath(path), "utf8"))
  assert.equal($("h1").length, 1, `Expected one heading: ${path}`)
  assert.equal(
    $("link[rel=canonical]").attr("href"),
    `${site.url}${path}`,
    `Wrong canonical: ${path}`
  )
  assert($("title").text().trim(), `Missing title: ${path}`)
  assert(
    $("meta[name=description]").attr("content"),
    `Missing description: ${path}`
  )
  assert(
    $("meta[property='og:image']").attr("content"),
    `Missing social image: ${path}`
  )
  $("a[href], img[src], script[src], link[href]").each((_, element) => {
    const href = $(element).attr("href") ?? $(element).attr("src")
    if (!href) return
    const target = new URL(href, `${site.url}${path}`)
    if (target.origin !== site.url) return
    const targetPath = decodeURIComponent(target.pathname)
    assert(
      existsSync(artifactPath(targetPath)),
      `Broken local asset/link: ${path} -> ${href}`
    )
    if (target.hash && targetPath.endsWith("/") && !redirects.has(targetPath)) {
      const destination = load(readFileSync(artifactPath(targetPath), "utf8"))
      assert(
        destination(`[id="${decodeURIComponent(target.hash.slice(1))}"]`)
          .length,
        `Broken anchor: ${path} -> ${href}`
      )
    }
  })
}
for (const document of documents.filter(
  (entry) => entry.kind !== "not-found"
)) {
  const $ = load(readFileSync(artifactPath(document.path), "utf8"))
  assert.equal(
    $("h1").text(),
    document.kind === "home" ? document.home.hero.title : document.title,
    `Missing prerendered heading: ${document.path}`
  )
  const structuredData = $("script[type='application/ld+json']").text()
  assert(structuredData, `Missing structured data: ${document.path}`)
  const graph = z
    .object({
      "@context": z.literal("https://schema.org"),
      "@graph": z.array(z.object({ "@type": z.string() })),
    })
    .parse(JSON.parse(structuredData))
  assert(graph["@graph"].length, `Empty structured data: ${document.path}`)
  if (document.content.trim())
    assert(
      $(".prose").text().trim(),
      `Missing prerendered prose: ${document.path}`
    )
}
for (const [path, target] of redirects) {
  const $ = load(readFileSync(artifactPath(path), "utf8"))
  assert.equal(
    $("link[rel=canonical]").attr("href"),
    `${site.url}${target}`,
    `Wrong redirect: ${path}`
  )
  assert(existsSync(artifactPath(target)), `Redirect target missing: ${target}`)
}
const feedPaths = requiredPaths.filter((path) => path.endsWith("index.xml"))
for (const path of feedPaths) {
  const $ = load(readFileSync(artifactPath(path), "utf8"), { xmlMode: true })
  assert.equal($("rss").attr("version"), "2.0", `Invalid RSS: ${path}`)
  assert($("channel > title").text(), `Missing feed title: ${path}`)
  $("item > link").each((_, element) => {
    const target = new URL($(element).text())
    assert.equal(target.origin, site.url, `Wrong feed origin: ${path}`)
    assert(
      existsSync(artifactPath(decodeURIComponent(target.pathname))),
      `Missing feed target: ${target.href}`
    )
  })
}
const sitemap = load(readFileSync(artifactPath("/sitemap.xml"), "utf8"), {
  xmlMode: true,
})
assert.deepEqual(
  new Set(
    sitemap("url > loc")
      .map((_, element) => sitemap(element).text())
      .get()
  ),
  new Set(canonicalPaths.map((path) => `${site.url}${path}`)),
  "Sitemap must contain exactly the canonical public pages"
)
assert.deepEqual(
  JSON.parse(readFileSync(artifactPath("/index.json"), "utf8")),
  searchEntries,
  "Search artifact must match the public catalog"
)
const missing = load(readFileSync(artifactPath("/404.html"), "utf8"))
assert.equal(missing("meta[name=robots]").attr("content"), "noindex")
assert.equal(
  missing("script").length,
  0,
  "Static 404 must not hydrate a different URL"
)
assert.equal(
  readFileSync(join(output, "CNAME"), "utf8").trim(),
  new URL(site.url).hostname
)
assert(
  !existsSync(join(output, "private")),
  "Private source material must stay local"
)
console.log(
  `Verified ${requiredPaths.length} preserved URLs, ${canonicalPaths.length} canonical pages, ${feedPaths.length} feeds, sitemap, search, local links/assets, metadata, redirects and static 404`
)
