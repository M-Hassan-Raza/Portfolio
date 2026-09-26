import { profile, openSource } from "#content"
import type { Profile } from "#content"
import { PageLink } from "@/components/content/page-link"

function ExperienceList({ entries }: { entries: Profile["experience"] }) {
  return (
    <ol className="space-y-6">
      {entries.map((entry) => (
        <li key={`${entry.title}-${entry.start}`}>
          <p className="text-sm text-muted-foreground">
            {entry.start} to {entry.end}
          </p>
          <h3 className="text-xl font-medium">
            {entry.title}, {entry.org}
          </h3>
          <p>{entry.summary}</p>
        </li>
      ))}
    </ol>
  )
}
function Education() {
  return (
    <ul className="space-y-4">
      {profile.education.map((entry) => (
        <li key={entry.degree}>
          <h3 className="font-medium">
            {entry.degree}, {entry.school}
          </h3>
          <p>{entry.dates}</p>
          {entry.note && <p>{entry.note}</p>}
        </li>
      ))}
    </ul>
  )
}
export function AboutDetails() {
  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold" id="work">
          Work
        </h2>
        <ExperienceList entries={profile.experience} />
        <p>{profile.early_roles}</p>
      </section>
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold" id="teaching">
          Teaching
        </h2>
        <ExperienceList entries={profile.teaching} />
        <PageLink path="/teaching/">More on teaching</PageLink>
      </section>
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold" id="education">
          Education
        </h2>
        <Education />
      </section>
      <PageLink path="/resume/">Resume</PageLink>
    </div>
  )
}
export function ResumeDetails() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p>
          {profile.now.role}, {profile.now.org} · {profile.location}
        </p>
        <p>{profile.now.scope}</p>
        <ul>
          <li>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
          <li>
            <a href={profile.links.github}>GitHub</a>
          </li>
          <li>
            <a href={profile.links.linkedin}>LinkedIn</a>
          </li>
        </ul>
      </section>
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Experience</h2>
        <ExperienceList entries={profile.experience} />
        <p>{profile.early_roles}</p>
      </section>
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Open source</h2>
        <p>
          {openSource.merged} merged pull requests across{" "}
          {openSource.projects.length} projects.
        </p>
        <PageLink path="/open-source/">The full record</PageLink>
      </section>
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Teaching</h2>
        <ExperienceList entries={profile.teaching} />
      </section>
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Education</h2>
        <Education />
      </section>
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Skills</h2>
        <dl className="space-y-4">
          {profile.skills.map((skill) => (
            <div key={skill.group}>
              <dt className="font-medium">{skill.group}</dt>
              <dd>{skill.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Awards</h2>
        <ul>
          {profile.awards.map((award) => (
            <li key={award}>{award}</li>
          ))}
        </ul>
      </section>
      <a
        href="/assets/muhammad-hassan-raza-resume.pdf"
        className="print:hidden"
      >
        Download as PDF
      </a>
    </div>
  )
}
