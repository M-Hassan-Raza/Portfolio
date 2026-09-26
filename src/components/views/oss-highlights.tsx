import { curatedWork, openSource } from "#content"

export function OpenSourceHighlights({ limit }: { limit?: number }) {
  return (
    <ul className="space-y-6">
      {curatedWork.items.slice(0, limit).map((highlight) => {
        const project = openSource.projects.find(
          (candidate) => candidate.repo === highlight.repo
        )
        const contribution = project?.prs.find(
          (pr) => pr.number === highlight.number
        )
        if (!contribution)
          throw new Error(
            `Curated PR missing from generated records: ${highlight.repo}#${highlight.number}`
          )
        return (
          <li key={contribution.url}>
            <p className="text-sm text-muted-foreground">
              {project?.name} · #{highlight.number}
            </p>
            <h3 className="text-xl font-medium">
              <a href={contribution.url}>{highlight.title}</a>
            </h3>
            <p>{highlight.note}</p>
          </li>
        )
      })}
    </ul>
  )
}
