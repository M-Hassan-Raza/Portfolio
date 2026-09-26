import { ThemeProvider } from "next-themes"
import { site } from "@/lib/site"
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { SiteHeader, SiteFooter } from "@/components/site-chrome"
import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Muhammad Hassan Raza" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/assets/favicon.svg", type: "image/svg+xml" },
      {
        rel: "alternate",
        href: "/index.xml",
        type: "application/rss+xml",
        title: "Muhammad Hassan Raza",
      },
    ],
  }),
  notFoundComponent: () => (
    <section className="space-y-6">
      <h1>Page not found</h1>
      <a href="/">Return home</a>
    </section>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          storageKey="pref-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content" className="mx-auto max-w-5xl px-6 py-12">
            {children}
          </main>
          <SiteFooter />
        </ThemeProvider>
        {import.meta.env.PROD && (
          <script
            defer
            src={site.umami.scriptUrl}
            data-website-id={site.umami.websiteId}
            data-domains={new URL(site.url).hostname}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}
