import type { FieldShape } from "./shape-field"
import type { Hue } from "@/lib/studio"

/** Home hero: four big cut shapes cropped by the viewport, SuperHi style. */
export const homeShapes: FieldShape[] = [
  {
    shape: "pentagon",
    hue: "lilac",
    className: "-top-24 -left-28 w-72 sm:-top-20 sm:-left-16 sm:w-[22rem]",
    rotate: -14,
    depth: 0.7,
    drift: { x: 6, y: -8, r: 2, duration: 12, delay: 0 },
  },
  {
    shape: "circle",
    hue: "sky",
    className: "-top-28 -right-32 w-72 sm:-top-24 sm:-right-24 sm:w-[24rem]",
    depth: 0.4,
    drift: { x: -6, y: 8, r: 0, duration: 14, delay: -3 },
  },
  {
    shape: "burst",
    hue: "rose",
    className: "-bottom-24 -left-20 hidden w-64 sm:block sm:w-80",
    rotate: 12,
    depth: 0.9,
    drift: { x: 5, y: 6, r: -2, duration: 10, delay: -5 },
  },
  {
    shape: "half",
    hue: "butter",
    className: "-right-16 -bottom-10 w-60 sm:-right-10 sm:w-[20rem]",
    rotate: -8,
    depth: 0.6,
    drift: { x: -5, y: -6, r: 1.5, duration: 11, delay: -7 },
    face: true,
  },
  {
    shape: "star",
    hue: "mint",
    className: "top-[42%] right-[17%] hidden w-16 lg:block",
    rotate: 8,
    depth: 1,
    drift: { x: 4, y: -6, r: 6, duration: 9, delay: -2 },
  },
]

const partner: Record<Hue, [Hue, Hue, Hue]> = {
  peach: ["lilac", "butter", "sky"],
  butter: ["peach", "mint", "lilac"],
  lilac: ["butter", "mint", "peach"],
  mint: ["sky", "butter", "rose"],
  sky: ["butter", "peach", "mint"],
  rose: ["butter", "lilac", "peach"],
}

/** Inner-page band: a quieter cluster on the right, cropped by the edge. */
export function bandShapes(hue: Hue, variant = 0): FieldShape[] {
  const [a, b, c] = partner[hue]
  const sets: FieldShape[][] = [
    [
      {
        shape: "scallop",
        hue: a,
        className: "-top-16 -right-20 w-56 sm:-top-10 sm:-right-12 sm:w-80",
        rotate: 10,
        depth: 0.5,
        drift: { x: -5, y: 7, r: 3, duration: 13, delay: -2 },
      },
      {
        shape: "star",
        hue: b,
        className: "top-[58%] right-[22%] hidden w-20 md:block",
        rotate: -6,
        depth: 1,
        drift: { x: 4, y: -6, r: 6, duration: 9, delay: -4 },
      },
      {
        shape: "half",
        hue: c,
        className: "-right-10 -bottom-16 hidden w-52 sm:block",
        rotate: -18,
        depth: 0.7,
      },
    ],
    [
      {
        shape: "arch",
        hue: a,
        className: "-right-10 -bottom-6 w-44 sm:right-[6%] sm:w-64",
        depth: 0.5,
        drift: { x: -4, y: -6, r: 1, duration: 12, delay: -1 },
      },
      {
        shape: "burst",
        hue: b,
        className: "-top-20 -right-24 w-56 sm:-right-16 sm:w-72",
        rotate: 14,
        depth: 0.8,
        drift: { x: 5, y: 7, r: -3, duration: 11, delay: -5 },
      },
      {
        shape: "circle",
        hue: c,
        className: "top-[46%] right-[30%] hidden w-10 lg:block",
        depth: 1,
        drift: { x: 6, y: -8, r: 0, duration: 10, delay: -3 },
      },
    ],
    [
      {
        shape: "notch",
        hue: a,
        className: "-top-12 -right-16 w-52 sm:right-[4%] sm:-top-10 sm:w-64",
        rotate: 12,
        depth: 0.6,
        drift: { x: -5, y: 6, r: 2, duration: 13, delay: -6 },
      },
      {
        shape: "pentagon",
        hue: b,
        className: "-right-14 -bottom-24 hidden w-60 sm:block",
        rotate: -10,
        depth: 0.8,
      },
      {
        shape: "star",
        hue: c,
        className: "top-[30%] right-[26%] hidden w-14 lg:block",
        rotate: 10,
        depth: 1,
        drift: { x: 4, y: -6, r: 8, duration: 9, delay: -2 },
      },
    ],
  ]
  return sets[variant % sets.length] ?? []
}
