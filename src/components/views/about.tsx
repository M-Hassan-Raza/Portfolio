import { page, tiltAt } from "@/lib/studio"
import { Download } from "lucide-react"
import type { ReactNode } from "react"
import { profile } from "#content"
import type { Document, Profile } from "#content"
import { ContentBody } from "@/components/content/body"
import { FlipCard } from "@/components/studio/flip-card"
import { Settle } from "@/components/studio/motion"
import { Band } from "@/components/studio/page-hero"
import { PillAnchor, PillLink } from "@/components/studio/pill"
import { Scribble } from "@/components/studio/scribble"
import { SectionHeading } from "@/components/studio/section-heading"
import { Shape } from "@/components/studio/shape"
import { bandShapes } from "@/components/studio/shape-presets"
import { Sticker } from "@/components/studio/sticker"
import type { Hue } from "@/lib/studio"
import { cn } from "@/lib/utils"

const resumePdf = "/assets/muhammad-hassan-raza-resume.pdf"

export function AboutView({
  document,
}: {
  document: Extract<Document, { kind: "about" }>
}) {
  return (
    <div data-hue="rose" className="flex flex-col gap-20 pb-8 sm:gap-28">
      <Band hue="rose" shapes={bandShapes("rose", 2).slice(1)}>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h1 className="inline-flex items-center gap-2.5 type-label text-sm text-hue-deep">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-hue"
              />
              {document.title}
            </h1>
            <p className="type-display text-ink">
              Hi, I’m{" "}
              <span className="relative inline-block">
                Hassan
                <Scribble
                  variant="circle"
                  delay={450}
                  className="absolute -inset-x-[14%] -inset-y-[18%] h-[136%] w-[128%]"
                />
              </span>
              .
            </p>
            <p className="max-w-xl type-lede text-ink-soft">
              {profile.now.role} at {profile.now.org}, based in{" "}
              {profile.location.split(",")[0]}. {profile.now.scope}
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <PillAnchor href={resumePdf} size="lg">
                <Download aria-hidden="true" />
                Download resume
              </PillAnchor>
              <PillLink to={page("/contact/")} size="lg" variant="paper">
                How I work
              </PillLink>
            </div>
          </div>
          <PortraitArch />
        </div>
      </Band>

      <section aria-label="A note" className="frame flex justify-center">
        <Letter>
          <ContentBody code={document.mdx} />
        </Letter>
      </section>

      <section aria-labelledby="work" className="frame flex flex-col gap-12">
        <SectionHeading
          id="work"
          title="The road so far"
          aside="Where the hours went, most recent first."
        />
        <Road entries={profile.experience} />
        <p className="max-w-read type-lede text-[1.15rem] text-ink-soft">
          {profile.early_roles}
        </p>
      </section>

      <section aria-labelledby="values" className="frame flex flex-col gap-12">
        <SectionHeading
          id="values"
          title="Things I care about"
          aside="Flip one over."
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <Settle as="li" key={value.title} index={index}>
              <FlipCard title={value.title} hue={value.hue} shape={value.shape}>
                {value.body}
              </FlipCard>
            </Settle>
          ))}
        </ul>
      </section>

      <section className="frame grid gap-6 lg:grid-cols-2">
        <div
          data-hue="butter"
          className="flex flex-col gap-6 rounded-2xl bg-hue-tint p-7 sm:p-9"
        >
          <h2 id="teaching" className="type-h3 text-ink">
            Teaching
          </h2>
          <ol className="flex flex-col gap-5">
            {profile.teaching.map((entry) => (
              <li key={entry.title} className="flex flex-col gap-1">
                <p className="type-label text-hue-deep tabular">
                  {entry.start} to {entry.end}
                </p>
                <p className="font-semibold text-ink">
                  {entry.title}, {entry.org}
                </p>
                <p className="text-ink-soft">{entry.summary}</p>
              </li>
            ))}
          </ol>
          <PillLink
            to={page("/teaching/")}
            variant="paper"
            size="sm"
            className="self-start"
          >
            More on teaching
          </PillLink>
        </div>
        <div
          data-hue="sky"
          className="flex flex-col gap-6 rounded-2xl bg-hue-tint p-7 sm:p-9"
        >
          <h2 id="education" className="type-h3 text-ink">
            Education
          </h2>
          <ul className="flex flex-col gap-5">
            {profile.education.map((entry) => (
              <li key={entry.degree} className="flex flex-col gap-1">
                <p className="type-label text-hue-deep">{entry.dates}</p>
                <p className="font-semibold text-ink">
                  {entry.degree}, {entry.school}
                </p>
                {entry.note && <p className="text-ink-soft">{entry.note}</p>}
              </li>
            ))}
          </ul>
          <PillLink
            to={page("/resume/")}
            variant="paper"
            size="sm"
            className="self-start"
          >
            The full resume
          </PillLink>
        </div>
      </section>
    </div>
  )
}

const values: {
  title: string
  body: string
  hue: Hue
  shape: "scallop" | "notch" | "burst" | "arch"
}[] = [
  {
    title: "The unglamorous middle",
    body: "The stock count that has to stay right when two cashiers sell the last item at once. The tenant boundary nobody should be able to cross.",
    hue: "peach",
    shape: "scallop",
  },
  {
    title: "Edge cases are the product",
    body: "Client work for retail shops turned into Polaris and taught me that the edge cases are the product.",
    hue: "lilac",
    shape: "notch",
  },
  {
    title: "Break it, then explain it",
    body: "The fastest way to understand a system is to break it and then explain why it broke.",
    hue: "mint",
    shape: "burst",
  },
  {
    title: "Real systems, not toys",
    body: "Start from a real system, not a toy that can’t break. Talk about tradeoffs, because the textbook answer is usually one of several.",
    hue: "sky",
    shape: "arch",
  },
]

/** The real headshot in a rounded arch, with a squiggle and a heart doodle. */
function PortraitArch() {
  return (
    <div className="relative mx-auto w-full max-w-[26rem]">
      <div data-hue="peach" className="absolute -top-6 -left-8 w-24 text-hue">
        <Shape name="star" className="w-full" />
      </div>
      <div className="relative overflow-hidden rounded-[999px_999px_28px_28px] border-[1.5px] border-ink bg-paper-raised">
        <img
          src="/assets/portrait.jpg"
          alt={`Portrait of ${profile.name}`}
          width={844}
          height={900}
          className="aspect-[5/6] w-full object-cover object-[50%_22%]"
        />
      </div>
      <Scribble
        variant="loop"
        delay={700}
        strokeWidth={3}
        className="absolute -right-6 bottom-10 h-16 w-40 sm:-right-14"
      />
      <Scribble
        variant="heart"
        delay={1100}
        strokeWidth={3}
        className="absolute -top-2 right-2 size-12 rotate-12"
      />
      <Sticker
        hue="butter"
        rotate={-7}
        className="absolute bottom-6 -left-4 sm:-left-8"
      >
        Lahore
      </Sticker>
    </div>
  )
}

/** A letter half out of its envelope, signed. */
function Letter({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex w-full max-w-[52rem] flex-col items-center">
      <Settle className="relative w-full" tilt={-1}>
        <div className="relative flex flex-col gap-6 rounded-lg bg-paper-raised px-6 pt-10 pb-24 shadow-float sm:px-14 sm:pt-14 sm:pb-28">
          <p className="type-label text-hue-deep">A note from Hassan</p>
          {children}
          <Signature />
        </div>
      </Settle>
      <div
        data-hue="rose"
        className="relative -mt-16 h-44 w-[106%] sm:h-52"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <path
            d="M20 0 H780 A20 20 0 0 1 800 20 V180 A20 20 0 0 1 780 200 H20 A20 20 0 0 1 0 180 V20 A20 20 0 0 1 20 0 Z"
            fill="var(--hue)"
          />
          <path
            d="M0 24 L400 130 L800 24"
            fill="none"
            stroke="var(--hue-tint)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
        <div
          data-hue="butter"
          className="absolute top-[42%] left-1/2 w-14 -translate-x-1/2 text-hue"
        >
          <Shape name="star" className="w-full" />
        </div>
      </div>
    </div>
  )
}

function Signature() {
  return (
    <svg
      viewBox="0 0 220 70"
      aria-label="Signed, Hassan"
      role="img"
      className="h-16 w-52 self-end text-ink"
    >
      <path
        d="M8 44 C14 20 22 10 24 18 C26 28 16 50 18 56 C22 42 32 34 40 36 C46 38 40 52 46 52 C52 52 56 38 62 40 C66 42 60 54 66 54 C74 54 76 36 84 38 C90 40 82 54 90 54 C98 54 100 36 110 38 C118 40 108 56 118 54 C130 52 134 30 146 34 C156 38 148 56 160 52 C172 48 178 36 190 36 M40 62 C90 58 150 58 212 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Year cards alternating along a winding peach road. */
function Road({ entries }: { entries: Profile["experience"] }) {
  const hues: Hue[] = ["lilac", "mint", "sky", "butter", "peach"]
  const rows = entries.length
  const path = Array.from({ length: rows }, (_, index) => {
    const y = index * 100
    return index % 2 === 0
      ? `C 95 ${y + 25}, 95 ${y + 75}, 50 ${y + 100}`
      : `C 5 ${y + 25}, 5 ${y + 75}, 50 ${y + 100}`
  }).join(" ")
  return (
    <div className="relative">
      <svg
        aria-hidden="true"
        viewBox={`0 0 100 ${rows * 100}`}
        preserveAspectRatio="none"
        className="absolute inset-y-0 left-1/2 hidden h-full w-[70%] -translate-x-1/2 md:block"
      >
        <path
          d={`M 50 0 ${path}`}
          fill="none"
          stroke="var(--peach-tint)"
          strokeWidth="26"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <ol className="relative flex flex-col gap-8 md:gap-2">
        {entries.map((entry, index) => {
          const hue = hues[index % hues.length] ?? "lilac"
          return (
            <li
              key={`${entry.title}-${entry.start}`}
              className={cn(
                "flex",
                index % 2 === 0 ? "md:justify-start" : "md:justify-end"
              )}
            >
              <Settle
                index={index}
                tilt={tiltAt(index) * 0.6}
                className="w-full md:w-[46%]"
              >
                <div
                  data-hue={hue}
                  className="flex flex-col gap-3 rounded-lg border-[1.5px] border-ink bg-paper-raised p-6 sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="flex flex-col">
                      <span className="type-label text-hue-deep">
                        {entry.start === entry.end
                          ? entry.start
                          : `${entry.start} to ${entry.end}`}
                      </span>
                      <span className="type-numeral text-[3.25rem] text-ink">
                        {entry.start.match(/\d{4}/)?.[0] ?? entry.start}
                      </span>
                    </p>
                    <span className="block size-12 shrink-0 text-hue">
                      <Shape
                        name={
                          (
                            [
                              "pentagon",
                              "scallop",
                              "notch",
                              "arch",
                              "burst",
                            ] as const
                          )[index % 5] ?? "circle"
                        }
                        className="size-full"
                      />
                    </span>
                  </div>
                  <h3 className="type-h3 text-ink">
                    {entry.title}
                    <span className="text-ink-soft">, {entry.org}</span>
                  </h3>
                  <p className="leading-relaxed text-ink-soft">
                    {entry.summary}
                  </p>
                </div>
              </Settle>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
