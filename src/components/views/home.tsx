import { page } from "@/lib/studio"
import { ArrowRight } from "lucide-react"
import { openSource, profile } from "#content"
import type { Document } from "#content"
import { requireDocument } from "@/lib/content/catalog"
import { allBooks } from "@/lib/content/books"
import { ProjectCard, entryRow } from "@/components/content/cards"
import { FitText } from "@/components/studio/fit-text"
import { IndexList } from "@/components/studio/index-list"
import { Settle } from "@/components/studio/motion"
import { PillLink, PillAnchor } from "@/components/studio/pill"
import { Portrait } from "@/components/studio/portrait"
import { Scribble } from "@/components/studio/scribble"
import { ArrowLink } from "@/components/studio/section-heading"
import { Shelf } from "@/components/studio/shelf"
import { StatBlock } from "@/components/studio/stat-block"
import { TiltCard } from "@/components/studio/tilt-card"
import { cn } from "@/lib/utils"

function requireProject(path: string) {
  const document = requireDocument(path)
  if (document.kind !== "project") throw new Error(`Not a project: ${path}`)
  return document
}

const offers = [
  "Architecture and AI reviews",
  "Hands-on builds",
  "Advisory for teams shipping something real",
]

export function HomeView({
  document,
}: {
  document: Extract<Document, { kind: "home" }>
}) {
  const { home } = document
  const works = [home.work.lead, ...home.work.more].map((reference) => ({
    project: requireProject(reference.page),
    note: reference.note,
  }))
  const [lead, ...rest] = works
  const agents = profile.proof.find((proof) => proof.value.includes("15"))
  const otherProof = profile.proof.filter((proof) => proof !== agents)
  const shelfPicks = [0, 3, 9, 13, 17, 20, 6]
    .map((index) => allBooks[index])
    .filter((book) => book !== undefined)

  return (
    <div className="flex flex-col">
      {/* Hero: the name fills the width; one small portrait; one headline. */}
      <section
        aria-labelledby="home-title"
        className="frame flex flex-col gap-8 pt-28 pb-20 sm:gap-10 sm:pt-32 sm:pb-28"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 type-label">
          <a
            href={profile.now.url}
            className="relative underline-offset-4 hover:underline"
          >
            {profile.now.role}, {profile.now.org}
            <Scribble
              variant="underline"
              delay={900}
              className="absolute -right-1 -bottom-2.5 left-[58%] h-2.5 text-ink"
            />
          </a>
          <span>{profile.location}</span>
        </div>
        <p className="-mt-2">
          <FitText text="Hassan Raza" rise />
        </p>
        <div className="grid gap-10 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] md:gap-14 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,14rem)]">
          <Portrait
            tilt={-4}
            className="-mt-2 w-36 self-start justify-self-end sm:w-48 md:-mt-4 md:w-full md:justify-self-auto"
          />
          <div className="flex max-w-3xl flex-col gap-6">
            <h1 id="home-title" className="type-display">
              {home.hero.title}
            </h1>
            <p className="max-w-[40rem] type-lede text-ink-soft">
              {home.hero.summary}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <PillLink to={page("/projects/")} size="lg">
                See the work
                <ArrowRight aria-hidden="true" strokeWidth={2.6} />
              </PillLink>
              <PillLink to={page("/blog/")} size="lg" variant="paper">
                Read the essays
              </PillLink>
            </div>
          </div>
        </div>
      </section>

      {/* Work: a tomato block of tilted cards. */}
      <section
        data-block="tomato"
        aria-labelledby="work-heading"
        className="surface-block"
      >
        <div className="frame flex flex-col gap-12 py-20 sm:gap-16 sm:py-28">
          <SectionTitle
            id="work-heading"
            title="Selected work"
            aside="Mostly products where a small mistake costs someone real money."
            link={{ to: "/projects/", label: "All work" }}
          />
          {lead && (
            <Settle tilt={0}>
              <ProjectCard
                project={lead.project}
                note={lead.note}
                index={0}
                lead
              />
            </Settle>
          )}
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {rest.map((work, index) => (
              <Settle as="li" key={work.project.path} index={index}>
                <ProjectCard
                  project={work.project}
                  note={work.note}
                  index={index + 1}
                />
              </Settle>
            ))}
          </ul>
        </div>
      </section>

      {/* Writing: rows that flood with each essay's colour. */}
      <section
        aria-labelledby="writing-heading"
        className="frame grid gap-10 py-20 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)] lg:gap-16"
      >
        <SectionTitle
          id="writing-heading"
          title="Latest writing"
          aside="Bugs I shipped, fixes that held, and a few opinions I changed my mind about."
          link={{ to: "/blog/", label: "Everything I’ve written" }}
          stacked
          className="lg:sticky lg:top-28 lg:self-start"
        />
        <IndexList
          size="compact"
          rows={home.writing.map((reference) =>
            entryRow(requireDocument(reference.page), reference.note)
          )}
        />
      </section>

      {/* Numbers: grass block, counting numerals and the shape grid. */}
      <section
        data-block="grass"
        aria-labelledby="numbers-heading"
        className="surface-block"
      >
        <div className="frame flex flex-col gap-14 py-20 sm:py-28">
          <SectionTitle
            id="numbers-heading"
            title="A few honest numbers"
            aside="Each one survives a follow-up question."
          />
          <div className="grid gap-16 md:grid-cols-2 md:gap-12">
            <StatBlock
              value={openSource.merged}
              label="merged pull requests in tools I use every day"
            >
              <ArrowLink to={page("/open-source/")} className="self-start">
                See every one
              </ArrowLink>
            </StatBlock>
            {agents && (
              <StatBlock
                value={Number.parseInt(agents.value, 10)}
                suffix="+"
                label={agents.label}
              />
            )}
          </div>
          <ul className="grid gap-6 sm:grid-cols-2">
            {otherProof.map((proof, index) => (
              <li key={proof.label}>
                <TiltCard
                  tilt={index % 2 === 0 ? -1.25 : 1}
                  className="flex h-full flex-col gap-2 bg-paper-raised p-6 text-ink sm:p-7"
                >
                  <span className="type-h2 tabular">{proof.value}</span>
                  <span className="font-serif text-[1.05rem] text-ink-soft">
                    {proof.label}
                  </span>
                </TiltCard>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* On the shelf: spines on paper, in tones of lemon. */}
      <section
        data-block="lemon"
        aria-labelledby="shelf-heading"
        className="frame grid items-end gap-10 py-20 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16"
      >
        <SectionTitle
          id="shelf-heading"
          title="On the shelf"
          aside="Hover a spine, or tap one, for the one-line verdict."
          link={{ to: "/books/", label: "All the shelves" }}
          stacked
        />
        <Shelf books={shelfPicks} />
      </section>

      {/* Contact: pink block, type and three tilted cards. */}
      <section
        data-block="pink"
        aria-labelledby="contact-heading"
        className="surface-block"
      >
        <div className="frame grid items-center gap-14 py-20 sm:py-28 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <h2
              id="contact-heading"
              className="type-display-xl text-block-deep"
            >
              Got a system that has to hold up?
            </h2>
            <p className="max-w-xl type-lede">
              I take on a small amount of outside work: architecture and AI
              reviews, hands-on builds, and advisory for teams shipping
              something real.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <PillLink to={page("/contact/")} size="lg">
                How I work
                <ArrowRight aria-hidden="true" strokeWidth={2.6} />
              </PillLink>
              <PillAnchor
                href={`mailto:${profile.email}`}
                size="lg"
                variant="paper"
              >
                {profile.email}
              </PillAnchor>
            </div>
          </div>
          <ol className="flex flex-col gap-5">
            {offers.map((offer, index) => (
              <li key={offer}>
                <TiltCard
                  tilt={[-2, 1.5, -1][index]}
                  className="flex items-baseline gap-5 bg-paper-raised px-6 py-5 text-ink"
                >
                  <span className="type-label tabular">0{index + 1}</span>
                  <span className="type-h3 text-[1.5rem]">{offer}</span>
                </TiltCard>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}

function SectionTitle({
  id,
  title,
  aside,
  link,
  stacked = false,
  className,
}: {
  id: string
  title: string
  aside?: string
  link?: { to: string; label: string }
  stacked?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        stacked
          ? "flex flex-col items-start gap-5"
          : "flex flex-wrap items-end justify-between gap-x-10 gap-y-5",
        className
      )}
    >
      <div className="flex max-w-3xl flex-col gap-4">
        <h2 id={id} className="type-display">
          {title}
        </h2>
        {aside && <p className="max-w-xl type-lede">{aside}</p>}
      </div>
      {link && <ArrowLink to={link.to}>{link.label}</ArrowLink>}
    </div>
  )
}
