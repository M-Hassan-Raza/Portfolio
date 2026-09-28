import { createLink } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Scribble } from "./scribble"
import { springs } from "./motion"

const tilts = [-4, 2.5, -2, 3, -1.5]
const offsets = [
  "sm:-translate-x-10",
  "sm:translate-x-12",
  "sm:-translate-x-4",
  "sm:translate-x-8",
  "sm:translate-x-0",
]

/**
 * A thought cloud of tilted speech bubbles, joined by little circles. The last
 * bubble is the action. Each springs in, staggered.
 */
export function BubbleStack({
  lines,
  action,
  className,
}: {
  lines: readonly ReactNode[]
  action: ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()
  const all = [...lines, action]
  return (
    <ul className={cn("flex flex-col items-center gap-0", className)}>
      {all.map((line, index) => {
        const last = index === all.length - 1
        const tilt = tilts[index % tilts.length] ?? 0
        return (
          <motion.li
            key={index}
            className={cn(
              "settle relative flex flex-col items-center",
              offsets[index % offsets.length]
            )}
            initial={
              reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, rotate: 0 }
            }
            whileInView={{ opacity: 1, scale: 1, rotate: tilt }}
            viewport={{ once: true, amount: 0.5 }}
            transition={
              reduced
                ? { duration: 0.12 }
                : { ...springs.pop, damping: 17, delay: index * 0.09 }
            }
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -top-4 size-7 rounded-full bg-paper-raised",
                  index % 2 === 0 ? "left-[18%]" : "right-[16%]"
                )}
              />
            )}
            <div
              className={cn(
                "relative rounded-full bg-paper-raised px-7 py-4 text-center text-[clamp(1.35rem,2.4vw+0.6rem,2.25rem)] leading-[1.1] font-bold tracking-[-0.035em] text-hue-deep [font-stretch:92%] shadow-soft sm:px-10 sm:py-5",
                last && "p-0 sm:p-0"
              )}
            >
              {line}
            </div>
          </motion.li>
        )
      })}
    </ul>
  )
}

function BubbleAnchor({ children, className, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "group relative flex items-center gap-3 rounded-full px-7 py-4 text-ink sm:px-10 sm:py-5",
        className
      )}
      {...props}
    >
      <span className="relative">
        {children}
        <Scribble
          variant="underline"
          className="absolute -bottom-2 left-0 h-3 w-full"
          delay={700}
        />
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-[0.8em] transition-transform duration-300 ease-(--ease-pop) group-hover:translate-x-1.5"
        strokeWidth={2.6}
      />
    </a>
  )
}

export const BubbleLink = createLink(BubbleAnchor)
export function BubbleMail(props: ComponentProps<"a">) {
  return <BubbleAnchor {...props} />
}
