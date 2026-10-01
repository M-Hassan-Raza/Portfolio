import { defineConfig } from "vite"
import contentCollections from "@content-collections/vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { asciiArt } from "./vite-plugin-ascii"

export default defineConfig({
  publicDir: "static",
  plugins: [
    asciiArt(),
    contentCollections(),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
        filter: ({ path }) => !/\.[^/]+$/.test(path),
      },
    }),
    viteReact(),
  ],
})
