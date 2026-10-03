/** One compiled document body, written by src/lib/content/split.ts. */
declare module "#content/bodies/*" {
  import type { BodyComponent, Heading } from "@/lib/content/types"

  const Body: BodyComponent
  export default Body
  export const headings: Heading[]
}
