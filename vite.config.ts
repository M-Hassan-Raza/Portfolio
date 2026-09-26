import { documents } from "./src/lib/content/catalog"
import { defineConfig } from "vite"
import contentCollections from "@content-collections/vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  publicDir: "static",
  plugins: [
    contentCollections(),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      prerender: { enabled: true, crawlLinks: false, failOnError: true },
      pages: documents
        .filter((document) => document.kind !== "not-found")
        .map((document) => ({
          path: document.path,
          prerender: { enabled: true },
        })),
    }),
    viteReact(),
  ],
})
