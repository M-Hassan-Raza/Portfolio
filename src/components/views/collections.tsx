import type { Document } from "#content"
import {
  articles,
  projects,
  books,
  requireDocument,
} from "@/lib/content/catalog"
import { EntryList } from "@/components/content/entry-list"
import { PageLink } from "@/components/content/page-link"

export function CollectionView({
  document,
}: {
  document: Extract<Document, { kind: "collection" }>
}) {
  switch (document.section) {
    case "blog":
      return (
        <div className="space-y-10">
          {document.startHere.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold">If you only read a few</h2>
              <ul className="space-y-5 py-5">
                {document.startHere.map((reference) => (
                  <li key={reference.page}>
                    <h3 className="text-xl">
                      <PageLink path={reference.page}>
                        {requireDocument(reference.page).title}
                      </PageLink>
                    </h3>
                    <p>{reference.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="text-2xl font-semibold">All writing</h2>
            <EntryList entries={articles} />
          </section>
        </div>
      )
    case "projects":
      return (
        <div className="space-y-10">
          {(["flagship", "side", "early"] as const).map((tier) => (
            <section key={tier}>
              <h2 className="text-2xl font-semibold">
                {
                  {
                    flagship: "Selected work",
                    side: "Side projects",
                    early: "Earlier work",
                  }[tier]
                }
              </h2>
              <EntryList
                entries={projects.filter((project) => project.tier === tier)}
              />
            </section>
          ))}
        </div>
      )
    case "books":
      return <EntryList entries={books} />
  }
}
