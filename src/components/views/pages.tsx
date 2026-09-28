import { page, hueForPath } from "@/lib/studio"
import { Link } from "@tanstack/react-router"
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  CalendarDays,
  Download,
  MapPin,
} from "lucide-react"
import type { ReactNode } from "react"
import type { Document } from "#content"
import { openSource, profile } from "#content"
import { documents } from "@/lib/content/catalog"
import { shelves } from "@/lib/content/books"
import { groupBy, yearOf } from "@/lib/format"
import { ContentBody } from "@/components/content/body"
import { EssayRow } from "@/components/content/cards"
import { Comments } from "@/components/content/comments"
import { BubbleMail, BubbleStack } from "@/components/studio/bubble-stack"
import { CopyEmail } from "@/components/studio/copy-email"
import { Settle } from "@/components/studio/motion"
import { Band, PageHero } from "@/components/studio/page-hero"
import { PillAnchor } from "@/components/studio/pill"
import { bandShapes } from "@/components/studio/shape-presets"
import { Shelf } from "@/components/studio/shelf"
import { MetaPill, Sticker } from "@/components/studio/sticker"
import { SwappedWord } from "@/components/studio/swapped-word"
import { SectionHeading } from "@/components/studio/section-heading"
import { ReadingLayout } from "./article"
import { headlineFor } from "./headlines"

/** Any plain page: a tinted band and a calm reading column. */
export function GenericPage({
  document,
  children,
  variant = 0,
}: {
  document: Document
  children?: ReactNode
  variant?: number
}) {
  const hue = hueForPath(document.path)
  return (
    <div data-hue={hue} className="flex flex-col gap-16 pb-8 sm:gap-20">
      <PageHero
        hue={hue}
        title={document.title}
        headline={headlineFor(document.path, document.title)}
        lede={document.description}
        shapes={bandShapes(hue, variant)}
      />
      {document.content.trim() ? (
        <ReadingLayout
          document={document}
          after={
            children || document.comments ? (
              <div className="flex flex-col gap-14">
                {children}
                {document.comments && <Comments path={document.path} />}
              </div>
            ) : undefined
          }
        />
      ) : (
        children && <div className="frame flex flex-col gap-14">{children}</div>
      )}
    </div>
  )
}

/* ── Contact ("How I work") ─────────────────────────────────────────── */

export function ContactView({ document }: { document: Document }) {
  const [before, last] = splitLast(document.title)
  return (
    <div data-hue="rose" className="flex flex-col gap-16 pb-8 sm:gap-20">
      <Band hue="rose" innerClassName="pb-16 sm:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col gap-4">
            <p className="inline-flex items-center gap-2.5 type-label text-sm text-hue-deep">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-hue"
              />
              Contact
            </p>
            <h1 className="type-display text-ink">
              {before}
              <SwappedWord hue="rose">{last}</SwappedWord>
            </h1>
            <p className="max-w-xl type-lede text-ink-soft">
              {document.description}
            </p>
          </div>
          <BubbleStack
            lines={[
              "Building something thoughtful?",
              "Want to talk founders, agents or books?",
            ]}
            action={
              <BubbleMail href={`mailto:${profile.email}`}>
                Say hello
              </BubbleMail>
            }
          />
        </div>
      </Band>
      <ReadingLayout
        document={document}
        after={
          <section
            aria-labelledby="reach"
            data-hue="rose"
            className="flex flex-col gap-6 rounded-2xl bg-hue-tint p-6 sm:p-9"
          >
            <h2 id="reach" className="type-h3 text-ink">
              The fastest way in
            </h2>
            <CopyEmail email={profile.email} />
            <div className="flex flex-wrap gap-2 pt-2">
              <PillAnchor
                href="https://cal.com/muhammad-hassan-raza/30min"
                variant="paper"
                size="sm"
              >
                <CalendarDays aria-hidden="true" />
                Book 30 minutes
              </PillAnchor>
              <PillAnchor href={profile.links.github} variant="ghost" size="sm">
                <ArrowUpRight aria-hidden="true" />
                GitHub
              </PillAnchor>
              <PillAnchor
                href={profile.links.linkedin}
                variant="ghost"
                size="sm"
              >
                <ArrowUpRight aria-hidden="true" />
                LinkedIn
              </PillAnchor>
            </div>
          </section>
        }
      />
    </div>
  )
}

function splitLast(title: string): [string, string] {
  const at = title.lastIndexOf(" ")
  return at < 0 ? ["", title] : [title.slice(0, at + 1), title.slice(at + 1)]
}

/* ── Resume ─────────────────────────────────────────────────────────── */

export function ResumeView({ document }: { document: Document }) {
  return (
    <div data-hue="rose" className="flex flex-col gap-16 pb-8 sm:gap-20">
      <PageHero
        hue="rose"
        title={document.title}
        headline={headlineFor(document.path, document.title)}
        lede={profile.now.scope}
        shapes={bandShapes("rose", 1)}
      >
        <PillAnchor
          href="/assets/muhammad-hassan-raza-resume.pdf"
          size="lg"
          className="print:hidden"
        >
          <Download aria-hidden="true" />
          Download as PDF
        </PillAnchor>
        <PillAnchor href={`mailto:${profile.email}`} size="lg" variant="paper">
          {profile.email}
        </PillAnchor>
      </PageHero>
      <div className="frame grid gap-12 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-4 rounded-lg bg-paper-sunk p-6">
            <p className="type-h3 text-ink">{profile.name}</p>
            <p className="text-ink-soft">
              {profile.now.role}, {profile.now.org}
            </p>
            <ul className="flex flex-col gap-2.5 text-sm font-medium text-ink">
              <li className="flex items-center gap-2.5">
                <MapPin aria-hidden="true" className="size-4 text-ink-faint" />
                {profile.location}
              </li>
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2.5 hover:text-ink-soft"
                >
                  <AtSign
                    aria-hidden="true"
                    className="size-4 text-ink-faint"
                  />
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={profile.links.github}
                  className="flex items-center gap-2.5 hover:text-ink-soft"
                >
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-ink-faint"
                  />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={profile.links.linkedin}
                  className="flex items-center gap-2.5 hover:text-ink-soft"
                >
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-ink-faint"
                  />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </aside>
        <div className="flex min-w-0 flex-col gap-14">
          {document.content.trim() && <ReadingLayout document={document} />}
          <ResumeSection title="Experience">
            <ol className="flex flex-col gap-4">
              {profile.experience.map((entry) => (
                <li
                  key={`${entry.title}-${entry.start}`}
                  className="grid gap-2 rounded-lg bg-paper-raised p-6 sm:grid-cols-[9rem_1fr] sm:gap-6"
                >
                  <p className="type-label text-hue-deep tabular">
                    {entry.start} to {entry.end}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-semibold text-ink">
                      {entry.title}, {entry.org}
                    </h3>
                    <p className="leading-relaxed text-ink-soft">
                      {entry.summary}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-ink-soft">{profile.early_roles}</p>
          </ResumeSection>
          <ResumeSection title="Open source">
            <p className="text-ink-soft">
              {openSource.merged} merged pull requests across{" "}
              {openSource.projects.length} projects.{" "}
              <Link
                to={page("/open-source/")}
                className="font-semibold text-ink underline decoration-mint-deep decoration-2 underline-offset-4"
              >
                The full record
              </Link>
            </p>
          </ResumeSection>
          <ResumeSection title="Teaching">
            <ul className="flex flex-col gap-3">
              {profile.teaching.map((entry) => (
                <li
                  key={entry.title}
                  className="grid gap-2 sm:grid-cols-[9rem_1fr] sm:gap-6"
                >
                  <p className="type-label text-hue-deep tabular">
                    {entry.start} to {entry.end}
                  </p>
                  <p className="text-ink-soft">
                    <span className="font-semibold text-ink">
                      {entry.title}, {entry.org}.
                    </span>{" "}
                    {entry.summary}
                  </p>
                </li>
              ))}
            </ul>
          </ResumeSection>
          <ResumeSection title="Education">
            <ul className="flex flex-col gap-3">
              {profile.education.map((entry) => (
                <li
                  key={entry.degree}
                  className="grid gap-2 sm:grid-cols-[9rem_1fr] sm:gap-6"
                >
                  <p className="type-label text-hue-deep">{entry.dates}</p>
                  <p className="text-ink-soft">
                    <span className="font-semibold text-ink">
                      {entry.degree}, {entry.school}.
                    </span>{" "}
                    {entry.note}
                  </p>
                </li>
              ))}
            </ul>
          </ResumeSection>
          <ResumeSection title="Skills">
            <dl className="grid gap-5 sm:grid-cols-2">
              {profile.skills.map((skill) => (
                <div key={skill.group} className="flex flex-col gap-2.5">
                  <dt className="font-semibold text-ink">{skill.group}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {skill.items.map((item) => (
                      <MetaPill key={item} tone="sunk">
                        {item}
                      </MetaPill>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </ResumeSection>
          <ResumeSection title="Awards">
            <ul className="flex flex-wrap gap-4">
              {profile.awards.map((award, index) => (
                <li key={award}>
                  <Sticker
                    hue={index % 2 === 0 ? "butter" : "lilac"}
                    rotate={index % 2 === 0 ? -3 : 2.5}
                    className="px-4 py-2"
                  >
                    {award}
                  </Sticker>
                </li>
              ))}
            </ul>
          </ResumeSection>
        </div>
      </div>
    </div>
  )
}

function ResumeSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="type-h2 text-ink">{title}</h2>
      {children}
    </section>
  )
}

/* ── Book shelf page ────────────────────────────────────────────────── */

export function ShelfPage({ document }: { document: Document }) {
  const shelf = shelves.find((entry) => entry.shelf.path === document.path)
  const others = shelves.filter((entry) => entry.shelf.path !== document.path)
  return (
    <div data-hue="sky" className="flex flex-col gap-16 pb-8 sm:gap-20">
      <PageHero
        hue="sky"
        title={document.title}
        headline={headlineFor(document.path, document.title)}
        lede={document.description}
        aside={shelf && <Shelf books={shelf.books} className="lg:pb-4" />}
      />
      <div className="frame flex flex-col gap-16">
        <ContentBody code={document.mdx} />
        {document.comments && (
          <div className="mx-auto w-full max-w-read">
            <Comments path={document.path} />
          </div>
        )}
        <nav aria-label="Other shelves" className="flex flex-col gap-6">
          <SectionHeading title="Other shelves" />
          <ul className="grid gap-4 sm:grid-cols-3">
            {others.map(({ shelf: other, books }) => (
              <li key={other.path}>
                <Link
                  to={other.path}
                  className="group flex h-full flex-col gap-2 rounded-lg bg-paper-raised p-6 transition-transform duration-300 ease-(--ease-settle) hover:-translate-y-1 hover:shadow-soft"
                >
                  <span className="type-label text-hue-deep">
                    {books.length} books
                  </span>
                  <span className="flex items-center justify-between gap-2 type-h3 text-ink">
                    {other.title}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-5 transition-transform duration-300 ease-(--ease-pop) group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

/* ── Archive ────────────────────────────────────────────────────────── */

export function ArchiveView({ document }: { document: Document }) {
  const dated = documents
    .filter((entry) => entry.publishedAt)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
  const years = groupBy(dated, (entry) => yearOf(entry.publishedAt ?? ""))
  return (
    <GenericPage document={document} variant={2}>
      <div className="flex flex-col gap-16">
        {years.map(([year, entries]) => (
          <section
            key={year}
            aria-labelledby={`year-${year}`}
            className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-12"
          >
            <h2
              id={`year-${year}`}
              className="type-numeral text-[clamp(3.5rem,6vw,5.5rem)] text-ink lg:sticky lg:top-28 lg:self-start"
            >
              {year}
            </h2>
            <ul className="flex flex-col gap-3">
              {entries.map((entry, index) => (
                <Settle as="li" key={entry.path} index={index < 6 ? index : 0}>
                  <EssayRow entry={entry} hue={hueForPath(entry.path)} />
                </Settle>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </GenericPage>
  )
}
