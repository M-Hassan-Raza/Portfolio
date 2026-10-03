import type { Document } from "@/lib/content/types"
import { profile } from "#content"
import type { Graph } from "schema-dts"
import { site } from "./site"

export function pageHead(
  page: Pick<Document, "path" | "title" | "description">,
  schema?: Graph
) {
  const url = `${site.url}${page.path}`
  const title =
    page.path === "/" ? profile.name : `${page.title} | ${profile.name}`
  const description = page.description || site.description
  const image = `${site.url}${site.socialImage}`
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: profile.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:site_name", content: profile.name },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: schema
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify(schema).replaceAll("<", "\\u003c"),
          },
        ]
      : [],
  }
}

export function documentHead(document: Document) {
  const url = `${site.url}${document.path}`
  const personId = `${site.url}/#person`
  const websiteId = `${site.url}/#website`
  const schema: Graph = {
    "@context": "https://schema.org",
    "@graph":
      document.kind === "home"
        ? [
            {
              "@type": "Person",
              "@id": personId,
              name: profile.name,
              url: `${site.url}/`,
              description: site.description,
              jobTitle: `${profile.now.role}, ${profile.now.org}`,
              image: `${site.url}${site.socialImage}`,
              sameAs: [
                profile.links.github,
                profile.links.linkedin,
                "https://stackoverflow.com/users/14460053/m-hassan-raza",
                "https://medium.com/@raihassanraza10",
              ],
            },
            {
              "@type": "WebSite",
              "@id": websiteId,
              name: profile.name,
              url: `${site.url}/`,
              description: site.description,
              publisher: { "@id": personId },
            },
          ]
        : [
            {
              "@type":
                document.kind === "article"
                  ? "BlogPosting"
                  : document.kind === "project"
                    ? "CreativeWork"
                    : document.kind === "about"
                      ? "ProfilePage"
                      : document.kind === "collection"
                        ? "CollectionPage"
                        : "WebPage",
              name: document.title,
              description: document.description,
              url,
              image: `${site.url}${site.socialImage}`,
              author: {
                "@type": "Person",
                "@id": personId,
                name: profile.name,
              },
              isPartOf: { "@id": websiteId },
              datePublished: document.publishedAt,
              dateModified: document.updatedAt ?? document.publishedAt,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: profile.name,
                  item: `${site.url}/`,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: document.title,
                  item: url,
                },
              ],
            },
          ],
  }
  const head = pageHead(document, schema)
  return {
    ...head,
    meta: [
      ...head.meta,
      {
        property: "og:type",
        content: document.kind === "article" ? "article" : "website",
      },
      ...(document.kind === "article" && document.publishedAt
        ? [
            {
              property: "article:published_time",
              content: document.publishedAt,
            },
            {
              property: "article:modified_time",
              content: document.updatedAt ?? document.publishedAt,
            },
          ]
        : []),
    ],
  }
}
