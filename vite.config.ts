import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  publicDir: "static",
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({ prerender: { enabled: true, crawlLinks: false } }),
    viteReact(),
  ],
})
