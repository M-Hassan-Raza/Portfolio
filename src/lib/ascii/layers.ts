import { MAX_LEVEL } from "./ramp"
import type { AsciiGrid } from "./ramp"
import { clamp01, easeOutCubic, hash01, hash32, smoothstep } from "./rng"
import type { AsciiLayer } from "./surface"

const clampLevel = (v: number) => (v < 0 ? 0 : v > MAX_LEVEL ? MAX_LEVEL : v)

/* ────────────────────────────── Reveal ("develop") ────────────────────────────── */

export type RevealOrder = "rows" | "diagonal" | "radial" | "random"

export interface RevealOptions {
  /** Total choreography length. 900ms reads as "intentional"; >1.2s reads as "loading". */
  duration?: number
  order?: RevealOrder
  /** Glyph-change quantum. 40ms ≈ 25Hz: fast enough to feel alive, slow enough not to boil. */
  tickMs?: number
  seed: number
  onDone?: () => void
}

/**
 * Each cell climbs the ink ramp from blank to its target level. Faint cells settle first,
 * dense cells last (cell duration scales with level), which reads like a print developing
 * rather than a curtain wiping. A decaying "fizz" of neighbouring glyphs and a faint fog
 * around the subject carry the texture; blank background far from the subject stays blank.
 */
export class RevealLayer implements AsciiLayer {
  readonly order = 0
  private readonly grid: AsciiGrid
  private readonly delay: Float32Array
  private readonly span: Float32Array
  private readonly rowEnd: Float32Array
  private readonly duration: number
  private readonly tickMs: number
  private readonly seed: number
  private readonly onDoneCallback?: () => void
  private start = -1
  private t = 0
  private prevT = 0
  private bucket = 0

  constructor(
    grid: AsciiGrid,
    {
      duration = 900,
      order = "diagonal",
      tickMs = 40,
      seed,
      onDone,
    }: RevealOptions
  ) {
    this.grid = grid
    this.duration = duration
    this.tickMs = tickMs
    this.seed = seed
    this.onDoneCallback = onDone
    const { cols, rows, levels } = grid
    this.delay = new Float32Array(cols * rows)
    this.span = new Float32Array(cols * rows)
    this.rowEnd = new Float32Array(rows)
    const cx = (cols - 1) / 2
    const cy = (rows - 1) / 2
    const maxR = Math.hypot(cx, cy * 2)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x
        const along =
          order === "rows"
            ? y / Math.max(1, rows - 1)
            : order === "diagonal"
              ? 0.35 * (x / Math.max(1, cols - 1)) +
                0.65 * (y / Math.max(1, rows - 1))
              : order === "radial"
                ? Math.hypot(x - cx, (y - cy) * 2) / maxR
                : 0
        const span = 0.3 + 0.25 * ((levels[i] ?? 0) / MAX_LEVEL) // density-aware settle time
        const delay = (0.72 * along + 0.28 * hash01(seed, i)) * (1 - span)
        this.span[i] = span
        this.delay[i] = delay
        this.rowEnd[y] = Math.max(this.rowEnd[y] ?? 0, delay + span)
      }
    }
  }

  begin(now: number) {
    if (this.start < 0) this.start = now
    const elapsed = now - this.start
    this.prevT = this.t
    this.t = elapsed / this.duration
    this.bucket = Math.floor(elapsed / this.tickMs)
    return this.prevT < 1 // run one extra frame at t>=1 so every row lands exactly on its final glyph
  }

  rows() {
    // First row not finished as of the *previous* frame, so a row gets its final write.
    let lo = 0
    while (lo < this.grid.rows && (this.rowEnd[lo] ?? 1) < this.prevT) lo++
    return lo < this.grid.rows ? ([lo, this.grid.rows - 1] as const) : null
  }

  cell(i: number, _x: number, _y: number, level: number) {
    const p = clamp01((this.t - (this.delay[i] ?? 0)) / (this.span[i] ?? 1))
    if (p >= 1) return level
    const noise = hash01(i, this.bucket, this.seed)
    if (level === 0) {
      // Fog: faint dust near the subject during the first 60% of a cell's life, never on far background.
      return this.grid.near[i] &&
        p > 0 &&
        p < 0.6 &&
        noise < 0.22 * (1 - p / 0.6)
        ? 1
        : 0
    }
    if (p <= 0) return 0
    let out = Math.round(level * easeOutCubic(p))
    if (noise < (1 - p) * 0.55)
      out += (hash32(this.seed, i, this.bucket) % 5) - 2
    return clampLevel(out)
  }

  onEnd() {
    this.onDoneCallback?.()
  }
}

/* ────────────────────────────── Lens ────────────────────────────── */

export type LensMode = "lift" | "shimmer" | "ripple"

export interface LensOptions {
  /** Radius in columns. Rows are scaled by the 1:2 cell aspect so the lens is visually round. */
  radius?: number
  /** Max levels added at the centre. */
  strength?: number
  mode?: LensMode
  /** Let the lens raise faint dust on blank cells next to the subject. */
  dust?: boolean
  seed: number
}

export class LensLayer implements AsciiLayer {
  readonly order = 10
  onEnd?: () => void
  private readonly grid: AsciiGrid
  private readonly frame: HTMLElement
  private readonly radius: number
  private readonly strength: number
  private readonly mode: LensMode
  private readonly dust: boolean
  private readonly seed: number
  private clientX = 0
  private clientY = 0
  private hasPointer = false
  private engaged = false
  private x = 0
  private y = 0
  private amp = 0
  private now = 0
  private bucket = 0

  constructor(
    grid: AsciiGrid,
    frame: HTMLElement,
    { radius = 16, strength = 5, mode = "lift", dust = true, seed }: LensOptions
  ) {
    this.grid = grid
    this.frame = frame
    this.radius = radius
    this.strength = strength
    this.mode = mode
    this.dust = dust
    this.seed = seed
  }

  /** Called from pointer events: store raw coordinates only, never read layout here. */
  point(clientX: number, clientY: number) {
    this.clientX = clientX
    this.clientY = clientY
    this.engaged = true
  }

  release() {
    this.engaged = false
  }

  get idle() {
    return !this.engaged && this.amp < 0.01
  }

  begin(now: number, dt: number) {
    this.now = now
    this.bucket = Math.floor(now / 70)
    // Read layout at the start of the frame, before any row writes: no forced reflow.
    const rect = this.frame.getBoundingClientRect()
    const tx = ((this.clientX - rect.left) / rect.width) * this.grid.cols
    const ty = ((this.clientY - rect.top) / rect.height) * this.grid.rows
    if (!this.hasPointer) {
      this.x = tx
      this.y = ty
      this.hasPointer = true
    }
    // Critically-damped-ish follow + fade: the lag is what makes it feel "premium" instead of glued.
    const follow = 1 - Math.exp(-(dt || 16) / 55)
    const fade = 1 - Math.exp(-(dt || 16) / (this.engaged ? 90 : 160))
    this.x += (tx - this.x) * follow
    this.y += (ty - this.y) * follow
    this.amp += ((this.engaged ? 1 : 0) - this.amp) * fade
    if (!this.engaged && this.amp < 0.01) {
      this.hasPointer = false
      return false
    }
    return true
  }

  rows() {
    const ry = this.radius / 2 + 1
    return [
      Math.max(0, Math.floor(this.y - ry)),
      Math.min(this.grid.rows - 1, Math.ceil(this.y + ry)),
    ] as const
  }

  cell(i: number, x: number, y: number, level: number) {
    const dx = x + 0.5 - this.x
    const dy = (y + 0.5 - this.y) * 2
    const d2 = dx * dx + dy * dy
    const r = this.radius
    if (d2 >= r * r) return level
    const d = Math.sqrt(d2)
    const f = (1 - smoothstep(0, r, d)) * this.amp
    if (level === 0 && !(this.dust && this.grid.near[i])) return level
    switch (this.mode) {
      case "lift":
        return clampLevel(level + Math.round(this.strength * f))
      case "shimmer":
        return hash01(i, this.bucket, this.seed) < f * 0.6
          ? clampLevel(
              level +
                (hash32(this.seed, i, this.bucket) % 5) -
                2 +
                Math.round(f * 2)
            )
          : level
      case "ripple":
        return clampLevel(
          level +
            Math.round(
              this.strength *
                f *
                (0.5 + 0.5 * Math.sin(d * 0.9 - this.now * 0.012))
            )
        )
    }
  }
}

/* ────────────────────────────── Idle shimmer ────────────────────────────── */

export interface ShimmerOptions {
  /** Mean gap between bursts. Deterministic per asset (seeded), jittered ±40%. */
  every?: number
  /** Burst length. */
  burst?: number
  /** Only cells at or above this level flicker, so blank paper never sparkles. */
  minLevel?: number
  /** Fraction of eligible cells inside the burst band that flicker per tick. */
  density?: number
  seed: number
}

/**
 * "Signal interference": every few seconds a short horizontal band of dense cells
 * flickers ±1–2 levels for a few hundred ms. Clustered bursts read as intentional;
 * uniform salt-and-pepper noise reads as a bug.
 */
export class ShimmerLayer implements AsciiLayer {
  readonly order = 20
  private readonly grid: AsciiGrid
  private readonly every: number
  private readonly burst: number
  private readonly minLevel: number
  private readonly density: number
  private readonly seed: number
  private start = -1
  private burstIndex = -1
  private band: readonly [number, number] | null = null
  private bucket = 0

  constructor(
    grid: AsciiGrid,
    {
      every = 3600,
      burst = 420,
      minLevel = 9,
      density = 0.18,
      seed,
    }: ShimmerOptions
  ) {
    this.grid = grid
    this.every = every
    this.burst = burst
    this.minLevel = minLevel
    this.density = density
    this.seed = seed
  }

  begin(now: number) {
    if (this.start < 0) this.start = now
    const elapsed = now - this.start
    const n = Math.floor(elapsed / this.every)
    const offset = (0.6 + 0.8 * hash01(this.seed, n)) * this.every * 0.5
    const phase = elapsed - n * this.every - offset
    if (phase >= 0 && phase < this.burst) {
      if (this.burstIndex !== n) {
        this.burstIndex = n
        const height = 2 + (hash32(this.seed, n, 7) % 4)
        const top =
          hash32(this.seed, n, 3) % Math.max(1, this.grid.rows - height)
        this.band = [top, top + height - 1]
      }
      this.bucket = Math.floor(phase / 60)
    } else {
      this.band = null
    }
    return true // runs until the hook detaches it (out of view / unmount)
  }

  rows() {
    return this.band
  }

  cell(i: number, _x: number, y: number, level: number) {
    const band = this.band
    if (!band || y < band[0] || y > band[1] || level < this.minLevel)
      return level
    if (hash01(i, this.bucket, this.seed ^ 0x51) >= this.density) return level
    return clampLevel(level + (hash32(i, this.bucket, this.seed) % 5) - 2)
  }
}
