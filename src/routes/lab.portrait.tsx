import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import type { ReactNode } from "react"
import { blockNames } from "@/lib/studio"
import type { BlockName } from "@/lib/studio"
import { cn } from "@/lib/utils"
import {
  Portrait,
  chosenPortrait,
  portraitTreatments,
} from "@/components/studio/portrait"

/**
 * Dev-only in spirit: not linked from nav, footer or sitemap, never
 * prerendered. Every portrait treatment at the size it would really use,
 * on paper and on a block, light and dark.
 */
export const Route = createFileRoute("/lab/portrait")({
  head: () => ({
    meta: [{ title: "Portrait lab" }, { name: "robots", content: "noindex" }],
  }),
  component: PortraitLab,
})

function Panel({
  label,
  night,
  block,
  paperBlock,
  children,
}: {
  label: string
  night: boolean
  block?: BlockName
  /** The section colour a paper panel sits inside (for cut-out and screenprint). */
  paperBlock?: BlockName
  children: ReactNode
}) {
  return (
    <figure
      className={cn(
        "flex flex-col gap-2 bg-paper p-2",
        night ? "dark" : "print-scope"
      )}
    >
      <div
        data-block={block ?? paperBlock}
        className={cn(
          "grid h-72 place-items-center px-6",
          block ? "surface-block" : "bg-paper text-ink"
        )}
      >
        <div className="w-[11.25rem]">{children}</div>
      </div>
      <figcaption className="type-label text-ink-soft">{label}</figcaption>
    </figure>
  )
}

function PortraitLab() {
  const [block, setBlock] = useState<BlockName>("violet")
  return (
    <div className="frame flex flex-col gap-12 pt-32 pb-24">
      <header className="flex max-w-3xl flex-col gap-4">
        <p className="type-label text-ink-soft">Lab, not linked anywhere</p>
        <h1 className="type-display">Portrait lab</h1>
        <p className="type-lede text-ink-soft">
          Ten treatments of the same headshot, each at the 180px it would really
          use, on cream paper and on a block, light and dark. The live pages use{" "}
          {chosenPortrait}.
        </p>
        <div
          role="group"
          aria-label="Block colour"
          className="flex flex-wrap gap-2 pt-2"
        >
          {blockNames.map((name) => (
            <button
              key={name}
              type="button"
              data-block={name}
              aria-pressed={block === name}
              onClick={() => setBlock(name)}
              className="pressable-flat flex h-9 cursor-pointer items-center gap-2 rounded-full border-2 border-ink px-3 text-sm font-semibold aria-pressed:bg-ink aria-pressed:text-paper"
            >
              <span className="size-3 rounded-full border-[1.5px] border-ink bg-block" />
              {name}
            </button>
          ))}
        </div>
      </header>
      <ol className="flex flex-col gap-14">
        {portraitTreatments.map((treatment, index) => (
          <li
            key={treatment.key}
            className="grid gap-6 border-t-2 border-ink pt-6 lg:grid-cols-[14rem_minmax(0,1fr)]"
          >
            <div className="flex flex-col gap-2">
              <p className="type-numeral text-[4.5rem]">{treatment.id}</p>
              <h2 className="type-h3">
                {treatment.name}
                {treatment.key === chosenPortrait && " (in use)"}
              </h2>
              <p className="font-serif text-ink-soft">{treatment.note}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <Panel label="Paper, light" night={false} paperBlock={block}>
                <Portrait treatment={treatment.key} tilt={index % 2 ? 3 : -3} />
              </Panel>
              <Panel label={`${block}, light`} night={false} block={block}>
                <Portrait treatment={treatment.key} tilt={index % 2 ? 3 : -3} />
              </Panel>
              <Panel label="Paper, dark" night paperBlock={block}>
                <Portrait treatment={treatment.key} tilt={index % 2 ? 3 : -3} />
              </Panel>
              <Panel label={`${block}, dark`} night block={block}>
                <Portrait treatment={treatment.key} tilt={index % 2 ? 3 : -3} />
              </Panel>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
