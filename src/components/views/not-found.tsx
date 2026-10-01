import { Home } from "lucide-react"
import type { ReactNode } from "react"
import { FitText } from "@/components/studio/fit-text"
import { pillVariants } from "@/components/studio/pill"
import { Scribble } from "@/components/studio/scribble"

/**
 * A tomato block, a 404 as wide as the page, and one ink circle drawing
 * itself round it. Plain anchors and a CSS-only draw, so the same markup
 * works in the standalone, script-free 404.html.
 */
export function NotFoundView({ body }: { body?: ReactNode }) {
  return (
    <section data-block="tomato" className="surface-block flex flex-1 flex-col">
      <div className="frame flex flex-col gap-10 pt-32 pb-20 sm:pt-36">
        <div className="relative px-[4%] text-block-deep">
          <FitText text="404" rise />
          <Scribble
            variant="circle"
            css
            strokeWidth={5}
            className="absolute -inset-x-[1%] -top-[12%] -bottom-[16%] h-[128%] w-[102%] text-ink-fixed"
          />
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-5">
            <h1 className="type-display">This page wandered off.</h1>
            <p className="max-w-xl type-lede">
              Nothing lives at this address. One of these probably does.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
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
          </div>
          {body && (
            <div className="-rotate-1 rounded-xl border-2 border-ink bg-paper-raised p-6 text-ink shadow-rest sm:p-8">
              {body}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
