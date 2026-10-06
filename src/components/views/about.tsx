import { page } from "@/lib/studio"
import { ArrowRight, Download } from "lucide-react"
import { profile } from "#content"
import type { Document } from "@/lib/content/types"
import { ContentBody } from "@/components/content/body"
import { Settle } from "@/components/studio/motion"
import { PillAnchor, PillLink } from "@/components/studio/pill"
import { SectionHeading } from "@/components/studio/section-heading"
import { TiltCard } from "@/components/studio/tilt-card"

const resumePdf = "/assets/muhammad-hassan-raza-resume.pdf"

const values: { title: string; body: string }[] = [
  {
    title: "The plumbing",
    body: "The stock count that has to stay right when two cashiers sell the last item at once, and the tenant boundary nobody should be able to cross.",
  },
  {
    title: "Edge cases",
    body: "Client work for retail shops turned into Polaris and taught me that the edge cases are the product.",
  },
  {
    title: "Breaking things on purpose",
    body: "The fastest way to understand a system is to break it and then explain why it broke.",
  },
  {
    title: "How I teach",
    body: "Start from a system that can break, and talk through the tradeoffs, because the textbook answer is usually one of several.",
  },
]

export function AboutView({
  document,
}: {
  document: Extract<Document, { kind: "about" }>
}) {
  return (
    <div data-block="violet" className="flex flex-col gap-20 pb-24 sm:gap-28">
      <header className="surface-block">
        <div className="frame flex flex-col pt-32 pb-14 sm:pt-40 sm:pb-20">
          <div className="flex flex-col gap-6">
            <h1 className="type-label">{document.title}</h1>
            <p
              className="text-[clamp(4rem,11vw,10.5rem)] leading-[0.86] font-extrabold tracking-[-0.055em] text-block-deep [font-stretch:86%]"
              style={{ fontVariationSettings: '"opsz" 96' }}
            >
              Hi, I’m Hassan.
            </p>
            <p className="max-w-2xl type-lede">
              {profile.now.role} at {profile.now.org}, based in{" "}
              {profile.location.split(",")[0]}. {profile.now.scope}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <PillAnchor href={resumePdf} size="lg">
                <Download aria-hidden="true" />
                Download resume
              </PillAnchor>
              <PillLink to={page("/contact/")} size="lg" variant="paper">
                How I work
              </PillLink>
            </div>
          </div>
        </div>
      </header>

      <section aria-label="A note" className="frame">
        <div className="mx-auto flex max-w-read flex-col gap-6">
          <p className="type-label text-ink-soft">A note from Hassan</p>
          <ContentBody path={document.path} />
        </div>
      </section>

      <section aria-labelledby="road" className="frame flex flex-col gap-12">
        <SectionHeading
          id="road"
          title="The road so far"
          aside="Where the hours went."
        />
        <ol className="grid gap-8 md:grid-cols-2 md:gap-x-10 md:gap-y-12">
          {profile.experience.map((entry, index) => (
            <Settle as="li" key={`${entry.title}-${entry.start}`} index={index}>
              <TiltCard
                tilt={[-1.5, 1.25, -0.75, 1.75, -1.25][index % 5]}
                className="flex h-full flex-col gap-3 bg-paper-raised p-6 text-ink sm:p-7"
              >
                <p className="flex items-baseline justify-between gap-4">
                  <span className="type-numeral text-[3.5rem] text-block-text">
                    {entry.start.match(/\d{4}/)?.[0] ?? entry.start}
                  </span>
                  <span className="type-label text-ink-soft tabular">
                    {entry.start === entry.end
                      ? entry.start
                      : `${entry.start} to ${entry.end}`}
                  </span>
                </p>
                <h3 className="type-h3">
                  {entry.title}
                  <span className="text-ink-soft">, {entry.org}</span>
                </h3>
                <p className="font-serif text-[1.02rem] leading-relaxed text-ink-soft">
                  {entry.summary}
                </p>
              </TiltCard>
            </Settle>
          ))}
        </ol>
        <p className="max-w-read font-serif text-[1.15rem] text-ink-soft">
          {profile.early_roles}
        </p>
      </section>

      <section
        data-block="violet"
        aria-labelledby="record"
        className="surface-block"
      >
        <div className="frame grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="flex flex-col gap-3">
            <h2 id="record" className="type-display text-block-deep">
              For the record
            </h2>
            <p className="type-lede">
              Recognition for Entropy Labs, the company. The credit is shared
              with the whole team.
            </p>
          </div>
          <ul className="flex flex-col border-t-2 border-current">
            {profile.recognition.map((item) => (
              <li
                key={item}
                className="border-b-2 border-current py-4 type-h3 text-[clamp(1.35rem,1.2vw+1rem,1.9rem)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="values" className="frame flex flex-col gap-12">
        <SectionHeading id="values" title="Things I care about" />
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {values.map((value, index) => (
            <Settle as="li" key={value.title} index={index}>
              <TiltCard
                tiltIndex={index}
                className="flex h-full flex-col gap-3 bg-paper-raised p-6 text-ink"
              >
                <h3 className="type-h3">{value.title}</h3>
                <p className="font-serif text-[1.02rem] leading-relaxed text-ink-soft">
                  {value.body}
                </p>
              </TiltCard>
            </Settle>
          ))}
        </ul>
      </section>

      <section className="frame grid gap-8 lg:grid-cols-2">
        <TiltCard
          tilt={-0.75}
          className="flex flex-col gap-6 bg-paper-raised p-7 text-ink sm:p-9"
        >
          <h2 id="teaching" className="type-h2">
            Teaching
          </h2>
          <ol className="flex flex-col gap-5">
            {profile.teaching.map((entry) => (
              <li key={entry.title} className="flex flex-col gap-1">
                <p className="type-label text-ink-soft tabular">
                  {entry.start} to {entry.end}
                </p>
                <p className="font-bold">
                  {entry.title}, {entry.org}
                </p>
                <p className="font-serif text-ink-soft">{entry.summary}</p>
              </li>
            ))}
          </ol>
          <PillLink
            to={page("/teaching/")}
            variant="paper"
            size="sm"
            className="mt-auto self-start"
          >
            More on teaching
            <ArrowRight aria-hidden="true" />
          </PillLink>
        </TiltCard>
        <TiltCard
          tilt={1}
          className="flex flex-col gap-6 bg-paper-raised p-7 text-ink sm:p-9"
        >
          <h2 id="education" className="type-h2">
            Education
          </h2>
          <ul className="flex flex-col gap-5">
            {profile.education.map((entry) => (
              <li key={entry.degree} className="flex flex-col gap-1">
                <p className="type-label text-ink-soft">{entry.dates}</p>
                <p className="font-bold">
                  {entry.degree}, {entry.school}
                </p>
                {entry.note && (
                  <p className="font-serif text-ink-soft">{entry.note}</p>
                )}
              </li>
            ))}
          </ul>
          <PillLink
            to={page("/resume/")}
            variant="paper"
            size="sm"
            className="mt-auto self-start"
          >
            The full resume
            <ArrowRight aria-hidden="true" />
          </PillLink>
        </TiltCard>
      </section>
    </div>
  )
}
