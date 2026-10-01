import Giscus from "@giscus/react"
import { ClientOnly } from "@tanstack/react-router"
import { useTheme } from "next-themes"
import { site } from "@/lib/site"

export function Comments({ path }: { path: string }) {
  const { resolvedTheme } = useTheme()
  return (
    <section aria-label="Comments">
      <ClientOnly>
        <Giscus
          key={path}
          repo={site.giscus.repo}
          repoId={site.giscus.repoId}
          category={site.giscus.category}
          categoryId={site.giscus.categoryId}
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme={
            resolvedTheme === "dark" ? "transparent_dark" : "noborder_light"
          }
          lang="en"
          loading="lazy"
        />
      </ClientOnly>
    </section>
  )
}
