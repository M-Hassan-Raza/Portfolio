import { Home } from "lucide-react"
import type { ReactNode } from "react"
import { BlobCreature } from "@/components/studio/characters"
import { pillVariants } from "@/components/studio/pill"
import { Scribble } from "@/components/studio/scribble"
import { SwappedWord } from "@/components/studio/swapped-word"

/**
 * A rose blob thinking hard about where your page went. Plain anchors, so the
 * same markup also works in the standalone, script-free 404.html.
 */
export function NotFoundView({ body }: { body?: ReactNode }) {
  return (
    <section className="frame flex flex-1 flex-col items-center justify-center gap-8 pt-36 pb-16 text-center">
      <div className="relative w-44 sm:w-52">
        <BlobCreature className="w-full" />
        <Scribble
          variant="sparkle"
          className="absolute -top-2 -right-8 size-10"
          delay={500}
        />
      </div>
      <div className="flex flex-col items-center gap-4">
        <h1 className="type-display text-ink">
          This page <SwappedWord hue="rose">wandered off</SwappedWord>.
        </h1>
        <p className="type-annotation text-xl text-ink-soft">
          The creature is looking into it.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <a href="/" className={pillVariants({ size: "lg" })}>
          <Home aria-hidden="true" />
          Take me home
        </a>
        <a
          href="/projects/"
          className={pillVariants({ size: "lg", variant: "paper" })}
        >
          See the work
        </a>
      </div>
      <div className="w-full max-w-read rounded-2xl bg-paper-raised p-6 text-left sm:p-9">
        {body}
      </div>
    </section>
  )
}
