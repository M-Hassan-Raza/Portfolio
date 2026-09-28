import { page } from "@/lib/studio"
import { Home } from "lucide-react"
import { BlobCreature } from "@/components/studio/characters"
import { PillLink } from "@/components/studio/pill"
import { Scribble } from "@/components/studio/scribble"
import { SwappedWord } from "@/components/studio/swapped-word"

/** A rose blob thinking hard about where your page went. */
export function NotFoundView() {
  return (
    <section className="frame flex flex-1 flex-col items-center justify-center gap-8 pt-36 pb-16 text-center">
      <div className="group relative w-44 sm:w-52">
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
        <p className="max-w-md type-lede text-ink-soft">
          It was moved, deleted, or never existed. The creature is looking into
          it.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <PillLink to="/" size="lg">
          <Home aria-hidden="true" />
          Take me home
        </PillLink>
        <PillLink to={page("/projects/")} size="lg" variant="paper">
          See the work
        </PillLink>
      </div>
    </section>
  )
}
