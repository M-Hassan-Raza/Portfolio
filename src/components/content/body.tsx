import { Children, isValidElement } from "react"
import type { ComponentProps, ReactElement, ReactNode } from "react"
import { CodeBlock } from "./code-block"
import { MDXContent } from "@content-collections/mdx/react"
import { profile, openSource } from "#content"
import { AsciiCover, Screen } from "./ascii-cover"
import { cn } from "@/lib/utils"

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

/**
 * Book pages author a flat run of heading, cover, author and review. This
 * groups each run into one card without touching the authored copy.
 */
function Div({ className, children, ...props }: ComponentProps<"div">) {
  if (className !== "book-container")
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  const books: ReactNode[][] = []
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === "h3") books.push([child])
    else books.at(-1)?.push(child)
  }
  return (
    <div
      className="not-prose grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
      {...props}
    >
      {books.map((parts, index) => {
        const [heading, ...rest] = parts
        const cover = rest.find(
          (part) =>
            isValidElement(part) &&
            (part as ReactElement<{ className?: string }>).props.className ===
              "book-cover"
        )
        const others = rest.filter((part) => part !== cover)
        return (
          <article key={index} className="book-entry">
            {cover}
            <div className="book-text">
              {heading}
              {others}
            </div>
          </article>
        )
      })}
    </div>
  )
}

const components = {
  AsciiCover,
  Screen,
  OssCount,
  ProofList,
  pre: CodeBlock,
  div: Div,
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
