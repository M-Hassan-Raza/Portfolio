import { page } from "@/lib/studio"
import { ArrowRight, Award, Sparkles, Star, Trophy } from "lucide-react"
import { openSource, profile } from "#content"
import type { Document } from "#content"
import { requireDocument } from "@/lib/content/catalog"
import { allBooks } from "@/lib/content/books"
import { EssayRow, ProjectCard } from "@/components/content/cards"
import { BubbleLink, BubbleStack } from "@/components/studio/bubble-stack"
import { PortraitDisc } from "@/components/studio/characters"
import { Settle } from "@/components/studio/motion"
import { BandArc } from "@/components/studio/page-hero"
import { PillLink } from "@/components/studio/pill"
import { SectionHeading, ArrowLink } from "@/components/studio/section-heading"
import { ShapeField } from "@/components/studio/shape-field"
import { homeShapes } from "@/components/studio/shape-presets"
import { Shelf } from "@/components/studio/shelf"
import { StatBlock } from "@/components/studio/stat-block"
import { Sticker } from "@/components/studio/sticker"
import { SwappedWord } from "@/components/studio/swapped-word"
import { WavyEdge } from "@/components/studio/wavy-edge"

function requireProject(path: string) {
  const document = requireDocument(path)
  if (document.kind !== "project") throw new Error(`Not a project: ${path}`)
  return document
}

/** Splits the hero title so one word can be swapped into the pill. */
function HeroTitle({ title }: { title: string }) {
  const word = "expensive"
  const at = title.indexOf(word)
  if (at < 0) return <>{title}</>
  return (
    <>
      {title.slice(0, at)}
      <SwappedWord hue="lilac">{word}</SwappedWord>
      {title.slice(at + word.length)}
    </>
  )
}

const recognitionIcons = [Trophy, Sparkles, Star, Award]

export function HomeView({
  document,
}: {
  document: Extract<Document, { kind: "home" }>
}) {
  const { home } = document
  const workRefs = [home.work.lead, ...home.work.more]
  const works = workRefs.map((reference) => ({
    project: requireProject(reference.page),
    note: reference.note,
  }))
  const [lead, ...rest] = works
  const agents = profile.proof.find((proof) => proof.value.includes("15"))
  const otherProof = profile.proof.filter((proof) => proof !== agents)
  const shelfPicks = [0, 3, 9, 13, 17, 20]
    .map((index) => allBooks[index])
    .filter((book) => book !== undefined)

  return (
    <div className="flex flex-col">
      {/* Hero: peach field, four cut shapes, the waving portrait. */}
      <section
        data-hue="peach"
        className="flex flex-col"
        aria-labelledby="home-title"
      >
        <div className="relative isolate overflow-clip bg-hue-tint">
          <ShapeField shapes={homeShapes} />
          <div className="relative frame flex flex-col items-center gap-8 pt-32 pb-16 text-center sm:pt-36 sm:pb-20">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <PortraitDisc className="size-20 sm:size-22" />
              <a
                href={profile.now.url}
                className="pressable inline-flex items-center gap-2 rounded-full bg-paper-raised px-4 py-1.5 text-sm font-medium text-ink-soft shadow-soft hover:text-ink"
              >
                <span
                  aria-hidden="true"
                  data-hue="mint"
                  className="size-2 rounded-full bg-hue"
                />
                {profile.now.role}, {profile.now.org}
              </a>
            </div>
            <h1
              id="home-title"
              className="max-w-[15ch] text-[clamp(2.9rem,5.2vw+1rem,6.25rem)] leading-[0.95] font-[740] tracking-[-0.032em] text-balance text-ink [font-stretch:94%]"
              style={{ fontVariationSettings: '"opsz" 96' }}
            >
              <HeroTitle title={home.hero.title} />
            </h1>
            <p className="max-w-[46rem] type-lede text-[clamp(1.1rem,0.5vw+1rem,1.3rem)] text-ink-soft">
              {home.hero.summary}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <PillLink to={page("/blog/")} size="lg">
                Read the essays
                <ArrowRight aria-hidden="true" strokeWidth={2.4} />
              </PillLink>
              <PillLink to={page("/projects/")} size="lg" variant="paper">
                See the work
              </PillLink>
            </div>
          </div>
        </div>
        <BandArc />
      </section>

      <div className="flex flex-col gap-20 pt-16 sm:gap-32 sm:pt-20">
        {/* Selected work: tilted sticker cards. */}
        <section
          aria-labelledby="work-heading"
          className="frame flex flex-col gap-12"
        >
          <SectionHeading
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
        </section>

        {/* Latest writing: stamp rows. */}
        <section
          aria-labelledby="writing-heading"
          data-hue="peach"
          className="frame grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16"
        >
          <div className="flex flex-col items-start gap-5 lg:sticky lg:top-28 lg:self-start">
            <h2 id="writing-heading" className="type-h2 text-ink">
              Latest writing
            </h2>
            <p className="type-annotation text-lg text-ink-soft">
              Bugs I shipped, fixes that held, and a few opinions I changed my
              mind about.
            </p>
            <ArrowLink to={page("/blog/")}>Everything I’ve written</ArrowLink>
          </div>
          <ul className="flex flex-col gap-4">
            {home.writing.map((reference, index) => (
              <Settle as="li" key={reference.page} index={index}>
                <EssayRow
                  entry={requireDocument(reference.page)}
                  note={reference.note}
                />
              </Settle>
            ))}
          </ul>
        </section>

        {/* Stats band: butter tint, numerals and shape grids. */}
        <section
          data-hue="butter"
          aria-labelledby="numbers-heading"
          className="flex flex-col"
        >
          <WavyEdge className="text-hue-tint" />
          <div className="bg-hue-tint">
            <div className="frame flex flex-col gap-14 py-14 sm:py-20">
              <div className="flex flex-col gap-2">
                <h2 id="numbers-heading" className="type-h2 text-ink">
                  A few honest numbers
                </h2>
                <p className="type-annotation text-lg text-ink-soft">
                  Each one survives a follow-up question.
                </p>
              </div>
              <div className="grid gap-16 md:grid-cols-2 md:gap-20">
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
              <ul className="grid gap-4 sm:grid-cols-2">
                {otherProof.map((proof) => (
                  <li
                    key={proof.label}
                    className="flex flex-col gap-2 rounded-lg bg-paper-raised p-6 sm:p-7"
                  >
                    <span className="type-serif-title text-[clamp(1.9rem,2.6vw+1rem,2.75rem)] leading-none tracking-[-0.03em] text-ink tabular">
                      {proof.value}
                    </span>
                    <span className="text-ink-soft">{proof.label}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4">
                <p className="type-label text-hue-deep">
                  Entropy Labs, for the record
                </p>
                <ul className="flex flex-wrap gap-4">
                  {profile.recognition.map((item, index) => (
                    <li key={item}>
                      <Sticker
                        icon={recognitionIcons[index % recognitionIcons.length]}
                        hue={
                          (["peach", "lilac", "mint", "sky"] as const)[
                            index % 4
                          ] ?? "peach"
                        }
                        rotate={[-3, 2.5, -1.5, 3][index % 4]}
                        className="px-4 py-2 text-[0.8125rem]"
                      >
                        {item}
                      </Sticker>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <WavyEdge className="text-hue-tint" flip />
        </section>

        {/* Now reading: spines on a shelf. */}
        <section
          aria-labelledby="shelf-heading"
          data-hue="sky"
          className="frame grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16"
        >
          <div className="flex flex-col items-start gap-5">
            <h2 id="shelf-heading" className="type-h2 text-ink">
              On the shelf
            </h2>
            <p className="type-annotation text-lg text-ink-soft">
              Hover a spine for the one-line verdict. The long versions live on
              the books page.
            </p>
            <ArrowLink to="/books/">All the shelves</ArrowLink>
          </div>
          <Shelf books={shelfPicks} />
        </section>

        {/* Contact: rose band with a thought cloud. */}
        <section
          data-hue="rose"
          aria-labelledby="contact-heading"
          className="flex flex-col"
        >
          <WavyEdge className="text-hue-tint" />
          <div className="bg-hue-tint">
            <div className="frame grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <div className="flex flex-col gap-5">
                <h2 id="contact-heading" className="type-h2 text-ink">
                  Got a system that has to hold up?
                </h2>
                <p className="max-w-md type-lede text-ink-soft">
                  I take on a small amount of outside work: architecture and AI
                  reviews, hands-on builds, and advisory for teams shipping
                  something real.
                </p>
              </div>
              <BubbleStack
                lines={[
                  "Architecture and AI reviews",
                  "Hands-on builds",
                  "Advisory for teams shipping something real",
                ]}
                action={
                  <BubbleLink to={page("/contact/")}>How I work</BubbleLink>
                }
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
