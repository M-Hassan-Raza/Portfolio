import { openSource } from "#content"
import { OpenSourceHighlights } from "./oss-highlights"

export function OpenSourceView() {
  return (
    <div className="space-y-10">
      <dl className="flex flex-wrap gap-8">
        <div>
          <dt className="text-2xl font-semibold">{openSource.merged}</dt>
          <dd>merged pull requests</dd>
        </div>
        <div>
          <dt className="text-2xl font-semibold">
            {openSource.projects.length}
          </dt>
          <dd>projects</dd>
        </div>
        <div>
          <dt>{openSource.generated}</dt>
          <dd>last refreshed from GitHub</dd>
        </div>
      </dl>
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">The ones I’d point to</h2>
        <OpenSourceHighlights />
      </section>
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Everything, by project</h2>
        {openSource.projects.map((project) => (
          <details key={project.repo} className="border-b border-border py-4">
            <summary className="cursor-pointer">
              {project.name} · {project.merged} merged
            </summary>
            <p className="py-4">{project.blurb ?? project.repo}</p>
            <ol className="space-y-3">
              {project.prs.map((pr) => (
                <li key={pr.number}>
                  <a href={pr.url}>{pr.title}</a>{" "}
                  <time
                    dateTime={pr.merged}
                    className="text-sm text-muted-foreground"
                  >
                    {pr.merged}
                  </time>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </section>
    </div>
  )
}
