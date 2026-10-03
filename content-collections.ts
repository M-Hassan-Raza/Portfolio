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
import { createCssVariablesTheme } from "shiki"
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
import { readShelf } from "./src/lib/content/shelf"
import {
  writeContentSplit,
  writeOpenSourceStats,
} from "./src/lib/content/split"

// Syntax colors come from --shiki-* tokens in src/theme.css, so code follows the site theme.
const codeTheme = createCssVariablesTheme({
  name: "site",
  variablePrefix: "--shiki-",
  fontStyle: true,
})

const documents = defineCollection({
  name: "documents",
  directory: "content",
  include: "**/*.mdx",
  schema: documentSchema,
  transform: async (document, context) => {
    if (
      document.draft ||
      (document.publishedAt && Date.parse(document.publishedAt) > Date.now())
    )
      return context.skip("Unpublished content")
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
        [rehypePrettyCode, { theme: codeTheme, keepBackground: false }],
      ],
    })
    const isShelf =
      document.path.startsWith("/books/") && document.path !== "/books/"
    return {
      ...document,
      mdx,
      text,
      headings,
      readingMinutes: Math.ceil(readingTime(text).minutes),
      hasBody: document.content.trim() !== "",
      books: isShelf ? readShelf(document.content) : [],
    }
  },
  onSuccess: (built) => writeContentSplit(built),
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
  onSuccess: (built) => (built ? writeOpenSourceStats(built) : undefined),
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
