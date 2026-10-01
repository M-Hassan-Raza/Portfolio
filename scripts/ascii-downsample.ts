/**
 * Writes a half-density `<key>-140.txt` next to every photographic cover.
 * At 280 columns a photo prints as 2 px glyphs, which read as texture; the
 * 140 column version keeps the characters legible in thumbnails and heroes.
 * Usage: pnpm tsx scripts/ascii-downsample.ts
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const dir = "assets/ascii-covers"
const ramp = " .':,;clxoXkKdO0MNW"
const photoInk = 0.3

function level(char: string | undefined) {
  if (!char || char === " ") return 0
  const index = ramp.indexOf(char)
  return index < 0 ? Math.round(ramp.length / 2) : index
}

for (const name of readdirSync(dir)) {
  if (!name.endsWith(".txt") || /-\d+\.txt$/.test(name)) continue
  const lines = readFileSync(join(dir, name), "utf8")
    .replace(/\n+$/, "")
    .split("\n")
  const cols = Math.max(...lines.map((line) => line.length))
  const ink =
    lines.join("").replace(/ /g, "").length / (cols * lines.length || 1)
  if (ink <= photoInk) continue

  const rows: string[] = []
  for (let y = 0; y + 1 < lines.length; y += 2) {
    let row = ""
    for (let x = 0; x + 1 < cols; x += 2) {
      const sum =
        level(lines[y]?.[x]) +
        level(lines[y]?.[x + 1]) +
        level(lines[y + 1]?.[x]) +
        level(lines[y + 1]?.[x + 1])
      row += ramp[Math.round(sum / 4)]
    }
    rows.push(row.replace(/ +$/, ""))
  }
  const target = join(
    dir,
    name.replace(/\.txt$/, `-${Math.floor(cols / 2)}.txt`)
  )
  writeFileSync(target, `${rows.join("\n")}\n`)
  console.log(`${target}  ${Math.floor(cols / 2)}x${rows.length}`)
}
