import type { SVGProps } from "react"
import { cn } from "@/lib/utils"

/**
 * The eight card-cut shapes. Every illustration on the site is composed from
 * these, so the whole thing looks drawn by one hand. Flat fills, no outlines.
 */
export const shapeNames = [
  "circle",
  "pentagon",
  "burst",
  "notch",
  "scallop",
  "arch",
  "half",
  "star",
] as const
export type ShapeName = (typeof shapeNames)[number]

const burstPoints = Array.from({ length: 24 }, (_, index) => {
  const radius = index % 2 === 0 ? 48 : 36
  const angle = (Math.PI * 2 * index) / 24 - Math.PI / 2
  return `${(50 + radius * Math.cos(angle)).toFixed(2)},${(50 + radius * Math.sin(angle)).toFixed(2)}`
}).join(" ")

const scallopLobes = Array.from({ length: 8 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 8
  return {
    cx: 50 + 29 * Math.cos(angle),
    cy: 50 + 29 * Math.sin(angle),
  }
})

/** Polygons get a same-colour round-joined stroke, which softens the corners like cut card. */
const soft = {
  stroke: "currentColor",
  strokeWidth: 8,
  strokeLinejoin: "round" as const,
}

function ShapeBody({ name }: { name: ShapeName }) {
  switch (name) {
    case "circle":
      return <circle cx="50" cy="50" r="50" />
    case "pentagon":
      return <polygon points="50,6 94,38 77,92 23,92 6,38" {...soft} />
    case "burst":
      return <polygon points={burstPoints} {...soft} strokeWidth={4} />
    case "notch":
      return (
        <path
          d="M8 4 H36 A14 14 0 0 0 64 4 H92 A4 4 0 0 1 96 8 V36 A14 14 0 0 0 96 64 V92 A4 4 0 0 1 92 96 H64 A14 14 0 0 0 36 96 H8 A4 4 0 0 1 4 92 V64 A14 14 0 0 0 4 36 V8 A4 4 0 0 1 8 4 Z"
          {...soft}
          strokeWidth={4}
        />
      )
    case "scallop":
      return (
        <g>
          <circle cx="50" cy="50" r="32" />
          {scallopLobes.map((lobe) => (
            <circle
              key={`${lobe.cx}-${lobe.cy}`}
              cx={lobe.cx}
              cy={lobe.cy}
              r="19"
            />
          ))}
        </g>
      )
    case "arch":
      return <path d="M4 100 V50 A46 46 0 0 1 96 50 V100 Z" />
    case "half":
      return <path d="M0 76 A50 50 0 0 1 100 76 Z" />
    case "star":
      return (
        <path
          d="M50 4 C55 34 66 45 96 50 C66 55 55 66 50 96 C45 66 34 55 4 50 C34 45 45 34 50 4 Z"
          {...soft}
          strokeWidth={6}
        />
      )
  }
}

export function Shape({
  name,
  className,
  ...props
}: { name: ShapeName } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={cn("block overflow-visible", className)}
      fill="currentColor"
      {...props}
    >
      <ShapeBody name={name} />
    </svg>
  )
}
