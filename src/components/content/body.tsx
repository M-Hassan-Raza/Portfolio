import { Suspense, use } from "react"
import { profile } from "#content"
import { ossStats } from "#content/oss-stats"
import { CodeBlock } from "./code-block"
import { AsciiCover, Screen } from "./ascii-cover"
import { cn } from "@/lib/utils"
import { coverAsset } from "@/components/studio/cover-card"
import { loadBody } from "@/lib/content/bodies"
import type { ComponentProps } from "react"

function OssCount() {
  return ossStats.merged
}
function ProofList() {
  return (
    <ul>
      {profile.proof.map((proof) => (
        <li key={proof.label}>
          <strong>{proof.value}</strong>: {proof.label}.
        </li>
      ))}
      <li>
        <strong>{ossStats.merged}</strong> merged pull requests in open-source
        tools like kitty, calibre and libtorrent.
      </li>
      <li>Entropy Labs: {profile.recognition.join("; ")}.</li>
    </ul>
  )
}
/** Authored covers print at card size, so they use the legible half-density art. */
function ProseCover(props: ComponentProps<typeof AsciiCover>) {
  return <AsciiCover {...props} asset={coverAsset(props.asset)} />
}
const components = {
  AsciiCover: ProseCover,
  Screen,
  OssCount,
  ProofList,
  pre: CodeBlock,
}

/**
 * The body of the document at `path`. Its chunk is already loaded by the time
 * this renders (route loader, or the client entry before hydration), so `use`
 * reads it synchronously; Suspense is only a safety net.
 */
export function ContentBody({
  path,
  className,
}: {
  path: string
  className?: string
}) {
  return (
    <div className={cn("prose-site prose max-w-none", className)}>
      <Suspense fallback={null}>
        <Body path={path} />
      </Suspense>
    </div>
  )
}
function Body({ path }: { path: string }) {
  const { default: Component } = use(loadBody(path))
  return <Component components={components} />
}
