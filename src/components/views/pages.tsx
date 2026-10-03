import { page, blockForSection } from "@/lib/studio"
import { Link } from "@tanstack/react-router"
import {
  ArrowUpRight,
  AtSign,
  CalendarDays,
  Check,
  Copy,
  Download,
  MapPin,
} from "lucide-react"
import type { ReactNode } from "react"
import type { Document } from "@/lib/content/types"
import { profile } from "#content"
import { ossStats } from "#content/oss-stats"
import { documents } from "@/lib/content/catalog"
import { groupBy, yearOf } from "@/lib/format"
import { cn } from "@/lib/utils"
import { ContentBody } from "@/components/content/body"
import { Comments } from "@/components/content/comments"
import { EntryList } from "@/components/content/entry-list"
import { useCopy } from "@/components/system/copy"
import { BlockHero } from "@/components/studio/block-hero"
import { PillAnchor } from "@/components/studio/pill"
import { MetaPill, Stamp } from "@/components/studio/tag"
import { TiltCard, TiltCardAnchor } from "@/components/studio/tilt-card"
import { ReadingLayout } from "./article"

/** Any plain page: a block in its section's colour and a calm reading column. */
export function GenericPage({
  document,
  children,
}: {
  document: Document
  children?: ReactNode
}) {
  const block = blockForSection(document.path)
  return (
    <div data-block={block} className="flex flex-col gap-16 pb-24 sm:gap-20">
      <BlockHero
        block={block}
        title={document.title}
        size={document.title.length > 9 ? "l" : "xl"}
        lede={document.description}
      />
      {document.hasBody ? (
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

function CopyEmail({ email }: { email: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className="flex flex-wrap items-center gap-4">
      <a
        href={`mailto:${email}`}
        className="text-[clamp(2rem,5vw+0.5rem,4.25rem)] leading-none font-extrabold tracking-[-0.045em] [font-stretch:90%] underline decoration-[0.08em] underline-offset-[0.14em] hover:decoration-[0.16em]"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={() => void copy(email, "Email copied")}
        className="pressable grid size-13 cursor-pointer place-items-center rounded-full border-2 border-ink bg-paper-raised text-ink"
        aria-label={copied ? "Email copied" : "Copy email address"}
      >
        {copied ? (
          <Check aria-hidden="true" className="size-5" strokeWidth={2.8} />
        ) : (
          <Copy aria-hidden="true" className="size-5" strokeWidth={2.4} />
        )}
      </button>
    </div>
  )
}

const elsewhere = [
  {
    label: "Book 30 minutes",
    note: "A call, if writing it down is harder.",
    href: "https://cal.com/muhammad-hassan-raza/30min",
    icon: CalendarDays,
  },
  {
    label: "GitHub",
    note: "The code, and the pull requests.",
    href: profile.links.github,
    icon: ArrowUpRight,
  },
  {
    label: "LinkedIn",
    note: "The formal version.",
    href: profile.links.linkedin,
    icon: ArrowUpRight,
  },
]

export function ContactView({ document }: { document: Document }) {
  return (
    <div data-block="pink" className="flex flex-col gap-16 pb-24 sm:gap-24">
      <BlockHero
        block="pink"
        title={document.title}
        size="xl"
        lede={document.description}
      />
      <section aria-labelledby="reach" className="frame flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h2 id="reach" className="type-label text-ink-soft">
            The fastest way in
          </h2>
          <CopyEmail email={profile.email} />
        </div>
        <ul className="grid gap-6 sm:grid-cols-3">
          {elsewhere.map((item, index) => (
            <li key={item.label}>
              <TiltCardAnchor
                href={item.href}
                tiltIndex={index}
                className="flex h-full items-start justify-between gap-4 bg-paper-raised p-6 text-ink"
              >
                <span className="flex flex-col gap-1.5">
                  <span className="type-h3">{item.label}</span>
                  <span className="font-serif text-ink-soft">{item.note}</span>
                </span>
                <item.icon
                  aria-hidden="true"
                  className="size-5 shrink-0"
                  strokeWidth={2.4}
                />
              </TiltCardAnchor>
            </li>
          ))}
        </ul>
      </section>
      <ReadingLayout document={document} />
    </div>
  )
}

/* ── Resume ─────────────────────────────────────────────────────────── */

export function ResumeView({ document }: { document: Document }) {
  return (
    <div data-block="violet" className="flex flex-col gap-16 pb-24 sm:gap-20">
      <BlockHero block="violet" title={document.title} lede={profile.now.scope}>
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
      </BlockHero>
      <div className="frame grid gap-12 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <TiltCard
            tilt={-1}
            className="flex flex-col gap-4 bg-paper-raised p-6 text-ink"
          >
            <p className="type-h3">{profile.name}</p>
            <p className="font-serif text-ink-soft">
              {profile.now.role}, {profile.now.org}
            </p>
            <ul className="flex flex-col gap-2.5 text-sm font-semibold">
              <li className="flex items-center gap-2.5">
                <MapPin aria-hidden="true" className="size-4" />
                {profile.location}
              </li>
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2.5 hover:underline"
                >
                  <AtSign aria-hidden="true" className="size-4" />
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={profile.links.github}
                  className="flex items-center gap-2.5 hover:underline"
                >
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={profile.links.linkedin}
                  className="flex items-center gap-2.5 hover:underline"
                >
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                  LinkedIn
                </a>
              </li>
            </ul>
          </TiltCard>
        </aside>
        <div className="flex min-w-0 flex-col gap-14">
          {document.hasBody && (
            <div className="max-w-read">
              <ContentBody path={document.path} />
            </div>
          )}
          <ResumeSection title="Experience">
            <ol className="flex flex-col border-t-2 border-ink">
              {profile.experience.map((entry) => (
                <li
                  key={`${entry.title}-${entry.start}`}
                  className="grid gap-2 border-b-2 border-ink py-5 sm:grid-cols-[9rem_1fr] sm:gap-6"
                >
                  <p className="type-label text-ink-soft tabular">
                    {entry.start} to {entry.end}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="type-h3">
                      {entry.title}, {entry.org}
                    </h3>
                    <p className="font-serif leading-relaxed text-ink-soft">
                      {entry.summary}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="font-serif text-ink-soft">{profile.early_roles}</p>
          </ResumeSection>
          <ResumeSection title="Open source">
            <p className="font-serif text-ink-soft">
              {ossStats.merged} merged pull requests across {ossStats.projects}{" "}
              projects.{" "}
              <Link
                to={page("/open-source/")}
                className="font-sans font-bold text-ink underline decoration-2 underline-offset-4"
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
                  <p className="type-label text-ink-soft tabular">
                    {entry.start} to {entry.end}
                  </p>
                  <p className="font-serif text-ink-soft">
                    <span className="font-sans font-bold text-ink">
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
                  <p className="type-label text-ink-soft">{entry.dates}</p>
                  <p className="font-serif text-ink-soft">
                    <span className="font-sans font-bold text-ink">
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
                  <dt className="font-bold">{skill.group}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {skill.items.map((item) => (
                      <MetaPill key={item}>{item}</MetaPill>
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
                  <Stamp rotate={index % 2 === 0 ? -2.5 : 2}>{award}</Stamp>
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
      <h2 className="type-h2">{title}</h2>
      {children}
    </section>
  )
}

/* ── Archive ────────────────────────────────────────────────────────── */

export function ArchiveView({ document }: { document: Document }) {
  const dated = documents
    .filter((entry) => entry.publishedAt)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
  const years = groupBy(dated, (entry) => yearOf(entry.publishedAt ?? ""))
  return (
    <GenericPage document={document}>
      <div className="flex flex-col gap-16">
        {years.map(([year, entries]) => (
          <section
            key={year}
            aria-labelledby={`year-${year}`}
            className={cn("flex flex-col gap-4")}
          >
            <h2
              id={`year-${year}`}
              className="type-numeral text-[clamp(3.5rem,6vw,5.5rem)]"
            >
              {year}
            </h2>
            <EntryList entries={entries} />
          </section>
        ))}
      </div>
    </GenericPage>
  )
}
