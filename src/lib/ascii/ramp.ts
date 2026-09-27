/**
 * Ink ramp: the jp2a default palette re-ordered by *measured* ink coverage of
 * Cascadia Code wght 400 in a 1:2 cell (see research/10-ascii-effects.md §1.4).
 * jp2a's own order is not monotonic in this font (":" < ";" is inverted, "x" < "d" etc.),
 * which makes lens/shimmer steps look lumpy if you walk jp2a's order.
 */
export const INK_RAMP = " .':,;clxoXkKdO0MNW"
export const MAX_LEVEL = INK_RAMP.length - 1
export const RAMP_CODES = Uint16Array.from(INK_RAMP, (ch) => ch.charCodeAt(0))

/** charCode → level. Unknown printable glyphs land mid-ramp so they still take part in effects. */
const LEVEL_OF = new Uint8Array(128).fill(Math.round(MAX_LEVEL / 2))
LEVEL_OF[32] = 0
for (let level = 0; level < INK_RAMP.length; level++)
  LEVEL_OF[INK_RAMP.charCodeAt(level)] = level

export interface AsciiGrid {
  cols: number
  rows: number
  /** Original glyph per cell (so the resting state is byte-identical to the SSR art). */
  chars: Uint16Array
  /** Ink level per cell, 0 = blank. */
  levels: Uint8Array
  /** 1 if the cell or a neighbour within `radius` has ink; used to keep fog/dust near the subject. */
  near: Uint8Array
}

export function parseGrid(
  text: string,
  cols: number,
  rows: number,
  nearRadius = 2
): AsciiGrid {
  const size = cols * rows
  const chars = new Uint16Array(size).fill(32)
  const levels = new Uint8Array(size)
  const lines = text.split("\n")
  for (let y = 0; y < rows; y++) {
    const line = lines[y] ?? ""
    const n = Math.min(line.length, cols)
    for (let x = 0; x < n; x++) {
      const code = line.charCodeAt(x)
      const i = y * cols + x
      chars[i] = code
      levels[i] = code < 128 ? (LEVEL_OF[code] ?? 0) : MAX_LEVEL
    }
  }
  return {
    cols,
    rows,
    chars,
    levels,
    near: dilate(levels, cols, rows, nearRadius),
  }
}

/** Separable box dilation of the ink mask: O(cells * r), runs once per surface. */
function dilate(levels: Uint8Array, cols: number, rows: number, r: number) {
  const horizontal = new Uint8Array(levels.length)
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      if (levels[y * cols + x])
        for (let dx = Math.max(0, x - r); dx <= Math.min(cols - 1, x + r); dx++)
          horizontal[y * cols + dx] = 1
  const out = new Uint8Array(levels.length)
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      if (horizontal[y * cols + x])
        for (let dy = Math.max(0, y - r); dy <= Math.min(rows - 1, y + r); dy++)
          out[dy * cols + x] = 1
  return out
}
