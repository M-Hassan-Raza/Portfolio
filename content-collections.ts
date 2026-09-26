import {
  defineCollection,
  defineConfig,
  defineSingleton,
} from "@content-collections/core"
import { compileMDX } from "@content-collections/mdx"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkMdx from "remark-mdx"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode from "rehype-pretty-code"
import { toString } from "mdast-util-to-string"
import { visit } from "unist-util-visit"
import GithubSlugger from "github-slugger"
import readingTime from "reading-time"
import {
  documentSchema,
  profileSchema,
  openSourceSchema,
  highlightsSchema,
} from "./src/lib/content/schema"

const documents = defineCollection({
  name: "documents",
  directory: "content",
  include: "**/*.mdx",
  schema: documentSchema,
  transform: async (document, context) => {
    const tree = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkGfm)
      .parse(document.content)
    const text = toString(tree)
    const slugger = new GithubSlugger()
    const headings: { title: string; id: string; depth: number }[] = []
    visit(tree, "heading", (node) => {
      const title = toString(node)
      headings.push({ title, id: slugger.slug(title), depth: node.depth })
    })
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
        [rehypePrettyCode, { theme: "github-dark", keepBackground: false }],
      ],
    })
    return {
      ...document,
      mdx,
      text,
      headings,
      readingMinutes: Math.ceil(readingTime(text).minutes),
    }
  },
})
const profile = defineSingleton({
  name: "profile",
  filePath: "data/profile.yaml",
  parser: "yaml",
  schema: profileSchema,
})
const openSource = defineSingleton({
  name: "openSource",
  filePath: "data/oss.json",
  parser: "json",
  schema: openSourceSchema,
})
const highlights = defineSingleton({
  name: "curatedWork",
  filePath: "data/oss_highlights.yaml",
  parser: "yaml",
  schema: highlightsSchema,
})

export default defineConfig({
  content: [documents, profile, openSource, highlights],
})
