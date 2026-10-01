import { readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"
import type { Plugin } from "vite"

/**
 * - `virtual:ascii-manifest` → { [key]: { cols, rows, ink } } (a few hundred bytes, safe to ship)
 * - `*.txt?ascii`           → right-trimmed, validated, HTML-escaped art as a string default export
 */
const MANIFEST_ID = "virtual:ascii-manifest"
const RESOLVED_MANIFEST_ID = `\0${MANIFEST_ID}`

function readArt(file: string) {
  const lines = readFileSync(file, "utf8").replace(/\n+$/, "").split("\n")
  const cols = Math.max(...lines.map((line) => line.length))
  const trimmed = lines.map((line) => line.replace(/ +$/, ""))
  const nonBlank = trimmed.reduce(
    (sum, line) => sum + line.replace(/ /g, "").length,
    0
  )
  return {
    cols,
    rows: lines.length,
    ink: +(nonBlank / (cols * lines.length)).toFixed(3),
    text: trimmed.join("\n"),
  }
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export function asciiArt({ dir = "assets/ascii-covers" } = {}): Plugin {
  let root = process.cwd()
  return {
    name: "portfolio:ascii-art",
    enforce: "pre",
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      return id === MANIFEST_ID ? RESOLVED_MANIFEST_ID : undefined
    },
    load(id) {
      if (id === RESOLVED_MANIFEST_ID) {
        const abs = resolve(root, dir)
        const entries = readdirSync(abs)
          .filter((name) => name.endsWith(".txt"))
          .map((name) => {
            const file = join(abs, name)
            this.addWatchFile(file)
            const { cols, rows, ink } = readArt(file)
            return [name.slice(0, -4), { cols, rows, ink }] as const
          })
        return `export const manifest = ${JSON.stringify(Object.fromEntries(entries))}`
      }
      const [file, query] = id.split("?")
      if (query === "ascii" && file?.endsWith(".txt")) {
        this.addWatchFile(file)
        return `export default ${JSON.stringify(escapeHtml(readArt(file).text))}`
      }
      return undefined
    },
  }
}
