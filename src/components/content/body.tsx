import { CodeBlock } from "./code-block"
import { MDXContent } from "@content-collections/mdx/react"
import { profile, openSource } from "#content"
import { AsciiCover, Screen } from "./ascii-cover"
import { cn } from "@/lib/utils"
import { coverAsset } from "@/components/studio/cover-card"
import type { ComponentProps } from "react"

function OssCount() {
  return openSource.merged
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
        <strong>{openSource.merged}</strong> merged pull requests in open-source
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

export function ContentBody({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  return (
    <div className={cn("prose-site prose max-w-none", className)}>
      <MDXContent code={code} components={components} />
    </div>
  )
}
