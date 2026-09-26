import { ThemeToggle } from "./theme-toggle"
import { profile } from "#content"
import { mainNavigation, footerNavigation } from "@/lib/site"
import { PageLink } from "./content/page-link"

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-5 px-6 py-6 print:hidden">
      <PageLink path="/" className="font-semibold">
        {profile.name}
      </PageLink>
      <nav aria-label="Main">
        <ul className="flex flex-wrap gap-5">
          {mainNavigation.map((item) => (
            <li key={item.path}>
              <PageLink path={item.path}>{item.label}</PageLink>
            </li>
          ))}
        </ul>
      </nav>
      <ThemeToggle />
    </header>
  )
}
export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-5xl space-y-6 border-t border-border px-6 py-8 print:hidden">
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-5">
          {footerNavigation.map((item) => (
            <li key={item.path}>
              <PageLink path={item.path}>{item.label}</PageLink>
            </li>
          ))}
        </ul>
      </nav>
      <p className="flex flex-wrap gap-5">
        <a href="/index.xml">RSS</a>
        <a href={profile.links.github}>GitHub</a>
        <a href={profile.links.linkedin}>LinkedIn</a>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <a href="#main-content">Back to top</a>
      </p>
    </footer>
  )
}
