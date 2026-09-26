import { z } from "zod"

export const sitePath = z.string().regex(/^\/(?:[a-z0-9.-]+\/)*$|^\/404\.html$/)
const reference = z.strictObject({ page: sitePath, note: z.string() })
const cover = z.strictObject({
  ascii: z.string().regex(/^[a-z0-9-]+$/),
  alt: z.string(),
  caption: z.string().optional(),
  screen: z.boolean().default(false),
  hidden: z.boolean().default(false),
})
const metadata = z.strictObject({
  title: z.string().min(1),
  description: z.string(),
  path: sitePath,
  content: z.string(),
  draft: z.boolean().default(false),
  publishedAt: z.iso.datetime({ offset: true }).optional(),
  updatedAt: z.iso.datetime({ offset: true }).optional(),
  aliases: z.array(sitePath).default([]),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  cover: cover.optional(),
  toc: z.boolean().default(false),
  comments: z.boolean().default(false),
  breadcrumbs: z.boolean().default(true),
})

export const documentSchema = z.discriminatedUnion("kind", [
  metadata.extend({
    kind: z.literal("home"),
    home: z.strictObject({
      hero: z.strictObject({
        title: z.string(),
        summary: z.string(),
        imageAlt: z.string(),
      }),
      work: z.strictObject({ lead: reference, more: z.array(reference) }),
      writing: z.array(reference),
    }),
  }),
  metadata.extend({ kind: z.literal("article") }),
  metadata.extend({
    kind: z.literal("project"),
    tier: z.enum(["flagship", "side", "early"]),
    weight: z.number().default(100),
    projectLabel: z.string().optional(),
    facts: z
      .strictObject({
        role: z.string().optional(),
        team: z.string().optional(),
        timeline: z.string().optional(),
        status: z.string().optional(),
        stack: z.array(z.string()).optional(),
        source: z
          .strictObject({ label: z.string(), url: z.url().optional() })
          .optional(),
      })
      .optional(),
    outcomes: z.array(z.string()).default([]),
  }),
  metadata.extend({
    kind: z.literal("collection"),
    section: z.enum(["blog", "projects", "books"]),
    startHere: z.array(reference).default([]),
  }),
  metadata.extend({ kind: z.literal("page"), kicker: z.string().optional() }),
  metadata.extend({ kind: z.literal("about") }),
  metadata.extend({ kind: z.literal("resume") }),
  metadata.extend({ kind: z.literal("open-source") }),
  metadata.extend({ kind: z.literal("search"), placeholder: z.string() }),
  metadata.extend({ kind: z.literal("archive") }),
  metadata.extend({ kind: z.literal("not-found") }),
])

const role = z.strictObject({
  title: z.string(),
  org: z.string(),
  start: z.string(),
  end: z.string(),
  summary: z.string(),
})
export const profileSchema = z.strictObject({
  name: z.string(),
  location: z.string(),
  email: z.email(),
  links: z.strictObject({
    site: z.string(),
    github: z.url(),
    linkedin: z.url(),
  }),
  now: z.strictObject({
    role: z.string(),
    org: z.string(),
    url: z.url(),
    since: z.string(),
    scope: z.string(),
  }),
  recognition: z.array(z.string()),
  proof: z.array(z.strictObject({ value: z.string(), label: z.string() })),
  experience: z.array(role),
  early_roles: z.string(),
  teaching: z.array(role),
  education: z.array(
    z.strictObject({
      degree: z.string(),
      school: z.string(),
      dates: z.string(),
      note: z.string().optional(),
    })
  ),
  awards: z.array(z.string()),
  skills: z.array(
    z.strictObject({ group: z.string(), items: z.array(z.string()) })
  ),
})
export const openSourceSchema = z.strictObject({
  generated: z.iso.date(),
  merged: z.number().int().nonnegative(),
  projects: z.array(
    z.strictObject({
      fork: z.boolean(),
      language: z.string().nullable(),
      name: z.string(),
      repo: z.string(),
      stars: z.number().int(),
      url: z.url(),
      blurb: z.string().optional(),
      merged: z.number().int(),
      prs: z.array(
        z.strictObject({
          title: z.string(),
          url: z.url(),
          number: z.number().int(),
          merged: z.iso.date(),
        })
      ),
    })
  ),
})
export const highlightsSchema = z.strictObject({
  items: z.array(
    z.strictObject({
      repo: z.string(),
      number: z.number().int(),
      title: z.string(),
      note: z.string(),
    })
  ),
})
