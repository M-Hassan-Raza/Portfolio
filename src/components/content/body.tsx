import { MDXContent } from "@content-collections/mdx/react"
import { profile, openSource } from "content-collections"
import { AsciiCover, Screen } from "./ascii-cover"

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
const components = { AsciiCover, Screen, OssCount, ProofList }

export function ContentBody({ code }: { code: string }) {
  return (
    <div className="prose max-w-none prose-neutral dark:prose-invert">
      <MDXContent code={code} components={components} />
    </div>
  )
}
