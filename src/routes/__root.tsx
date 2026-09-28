import { ThemeProvider } from "next-themes"
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { site } from "@/lib/site"
import { SiteFooter, SiteHeader } from "@/components/site-chrome"
import { SiteProviders } from "@/components/system/providers"
import { NotFoundView } from "@/components/views/not-found"
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
      {
        rel: "preload",
        href: "/fonts/ascii-ink.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "icon", href: "/assets/favicon.svg", type: "image/svg+xml" },
      {
        rel: "alternate",
        href: "/index.xml",
        type: "application/rss+xml",
        title: "Muhammad Hassan Raza",
      },
    ],
  }),
  notFoundComponent: NotFoundView,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Lets CSS tell "JS will run" from no-JS before first paint, so ASCII reveals never flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.dataset.js=''",
          }}
        />
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
          <SiteProviders>
            <div className="isolate flex min-h-dvh flex-col">
              <a
                href="#main-content"
                className="sr-only rounded-full focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-skip-link focus:bg-ink focus:px-5 focus:py-3 focus:font-semibold focus:text-paper"
              >
                Skip to content
              </a>
              <SiteHeader />
              <main id="main-content" className="flex flex-1 flex-col">
                {children}
              </main>
              <SiteFooter />
            </div>
          </SiteProviders>
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
