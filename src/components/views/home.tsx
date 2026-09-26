import { Link } from "@tanstack/react-router"
import { profile, openSource } from "#content"
import type { Document } from "#content"
import { requireDocument } from "@/lib/content/catalog"
import { AsciiCover } from "@/components/content/ascii-cover"
import { buttonVariants } from "@/components/ui/button"
import { OpenSourceHighlights } from "./oss-highlights"

export function HomeView({
  document,
}: {
  document: Extract<Document, { kind: "home" }>
}) {
  const { home } = document
  return (
    <div className="space-y-16">
      <section className="grid items-center gap-8 sm:grid-cols-2">
        <div className="space-y-5">
          <p>
            {profile.now.role}, <a href={profile.now.url}>{profile.now.org}</a>
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            {home.hero.title}
          </h1>
          <p className="text-lg text-muted-foreground">{home.hero.summary}</p>
          <div className="flex gap-3">
            <Link
              to="/$/"
              params={{ _splat: "projects" }}
              className={buttonVariants()}
            >
              See the work
            </Link>
            <a
              className={buttonVariants({ variant: "outline" })}
              href={`mailto:${profile.email}`}
            >
              Get in touch
            </a>
          </div>
        </div>
        <AsciiCover asset="profile" alt={home.hero.imageAlt} />
      </section>
      <section aria-label="Proof points" className="space-y-6">
        <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-2xl font-semibold">{openSource.merged}</dt>
            <dd>merged PRs across {openSource.projects.length} projects</dd>
          </div>
          {profile.proof.map((proof) => (
            <div key={proof.label}>
              <dt className="text-2xl font-semibold">{proof.value}</dt>
              <dd>{proof.label}</dd>
            </div>
          ))}
        </dl>
        <p>Entropy Labs: {profile.recognition.join(" · ")}</p>
      </section>
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Selected work</h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {[home.work.lead, ...home.work.more].map((reference) => (
            <li key={reference.page} className="space-y-2">
              <h3 className="text-xl font-medium">
                <Link to={reference.page}>
                  {requireDocument(reference.page).title}
                </Link>
              </h3>
              <p>{reference.note}</p>
            </li>
          ))}
        </ul>
        <Link to="/$/" params={{ _splat: "projects" }}>
          All work
        </Link>
      </section>
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Patches in tools I use</h2>
        <OpenSourceHighlights limit={3} />
        <Link to="/$/" params={{ _splat: "open-source" }}>
          All {openSource.merged} PRs
        </Link>
      </section>
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Writing</h2>
        <ul className="space-y-5">
          {home.writing.map((reference) => (
            <li key={reference.page}>
              <h3 className="text-xl font-medium">
                <Link to={reference.page}>
                  {requireDocument(reference.page).title}
                </Link>
              </h3>
              <p>{reference.note}</p>
            </li>
          ))}
        </ul>
        <Link to="/$/" params={{ _splat: "blog" }}>
          Everything
        </Link>
      </section>
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">
          Got a system that has to hold up?
        </h2>
        <p>
          I take on a small amount of outside work: architecture and AI reviews,
          hands-on builds, and advisory for teams shipping something real.
        </p>
        <Link to="/$/" params={{ _splat: "contact" }}>
          How I work
        </Link>
      </section>
    </div>
  )
}
