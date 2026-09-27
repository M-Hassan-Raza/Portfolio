import { parseGrid, RAMP_CODES } from "./ramp"
import type { AsciiGrid } from "./ramp"
import { subscribeFrame } from "./frame-loop"

/**
 * A layer maps ink levels. Layers compose bottom → top (reveal, then lens, then shimmer).
 * `begin` runs for every layer before any DOM write, so layers may *read* layout there
 * (e.g. the lens reads getBoundingClientRect) without forcing a synchronous reflow.
 */
export interface AsciiLayer {
  readonly order: number
  /** Advance internal state. Return false when finished; the surface drops the layer. */
  begin: (now: number, dt: number) => boolean
  /** Inclusive row span this layer affects this frame, or null for "nothing to draw". */
  rows: () => readonly [number, number] | null
  /** Map one cell. `level` is the output of the layers underneath. Must be pure for this frame. */
  cell: (i: number, x: number, y: number, level: number) => number
  onEnd?: () => void
}

type FxState = "armed" | "live" | "idle"

/**
 * Owns a client-only overlay <pre> that sits exactly on top of the SSR <pre>
 * (same class, same inline font-size, so identical metrics). React never renders
 * into the overlay, and the SSR <pre> is never mutated, so hydration and
 * no-JS output are untouched. Rows are block-level spans: writing one row only
 * invalidates that line box (measured: 20 dirty rows ≈ 0.7ms/frame on M5 Pro, 1.9ms at 4× CPU throttle).
 */
export class AsciiSurface {
  readonly grid: AsciiGrid
  private readonly frame: HTMLElement
  private readonly pre: HTMLElement
  private overlay: HTMLPreElement | null = null
  private rowNodes: Text[] = []
  private rowCache: string[] = []
  private layers: AsciiLayer[] = []
  private dirty: readonly [number, number] | null = null
  private unsubscribe: (() => void) | null = null
  private readonly fpsByLayer = new Map<AsciiLayer, number>()
  private fps = 0
  private readonly row: Uint16Array
  private readonly decoder = new TextDecoder("utf-16le")

  constructor(
    frame: HTMLElement,
    pre: HTMLElement,
    cols: number,
    rows: number
  ) {
    this.frame = frame
    this.pre = pre
    this.grid = parseGrid(pre.textContent, cols, rows)
    this.row = new Uint16Array(cols)
  }

  /** Hide the static art (CSS keys off data-fx) without drawing anything yet. */
  arm() {
    if (!this.layers.length) this.setState("armed")
  }

  add(layer: AsciiLayer, fps = 30) {
    this.layers = [...this.layers, layer].sort((a, b) => a.order - b.order)
    this.fpsByLayer.set(layer, fps)
    this.ensureOverlay()
    // Paint frame 0 synchronously so there is never a frame of "static art, then effect".
    this.tick(performance.now(), 0)
    this.restartLoop()
  }

  remove(layer: AsciiLayer) {
    if (!this.layers.includes(layer)) return
    this.layers = this.layers.filter((l) => l !== layer)
    this.fpsByLayer.delete(layer)
    if (!this.layers.length) return this.park()
    this.tick(performance.now(), 0)
    this.restartLoop()
  }

  dispose() {
    this.layers = []
    this.fpsByLayer.clear()
    this.park()
  }

  /** The loop runs at the fastest cap any attached layer asked for; recomputed when layers leave. */
  private restartLoop() {
    const fps = Math.max(
      ...this.layers.map((l) => this.fpsByLayer.get(l) ?? 30)
    )
    if (fps === this.fps && this.unsubscribe) return
    this.fps = fps
    this.unsubscribe?.()
    this.unsubscribe = subscribeFrame((now, dt) => this.tick(now, dt), this.fps)
  }

  private tick(now: number, dt: number): boolean {
    const finished: AsciiLayer[] = []
    const active = this.layers.filter(
      (layer) => layer.begin(now, dt) || (finished.push(layer), false)
    )

    let lo = this.dirty ? this.dirty[0] : Infinity
    let hi = this.dirty ? this.dirty[1] : -Infinity
    let nextLo = Infinity
    let nextHi = -Infinity
    for (const layer of active) {
      const span = layer.rows()
      if (!span) continue
      nextLo = Math.min(nextLo, span[0])
      nextHi = Math.max(nextHi, span[1])
    }
    lo = Math.max(0, Math.min(lo, nextLo))
    hi = Math.min(this.grid.rows - 1, Math.max(hi, nextHi))
    for (let y = lo; y <= hi; y++) this.renderRow(y, active)
    // Rows touched this frame must be re-rendered next frame so they fall back to base.
    this.dirty = nextLo <= nextHi ? [nextLo, nextHi] : null

    if (finished.length) {
      this.layers = this.layers.filter((l) => !finished.includes(l))
      finished.forEach((l) => {
        this.fpsByLayer.delete(l)
        l.onEnd?.()
      })
      if (this.layers.length) queueMicrotask(() => this.restartLoop())
    }
    if (!this.layers.length) {
      this.park()
      return false
    }
    return true
  }

  private renderRow(y: number, layers: readonly AsciiLayer[]) {
    const { cols, chars, levels } = this.grid
    const offset = y * cols
    const buffer = this.row
    for (let x = 0; x < cols; x++) {
      const i = offset + x
      const base = levels[i] ?? 0
      let level = base
      for (const layer of layers) level = layer.cell(i, x, y, level)
      buffer[x] = level === base ? (chars[i] ?? 32) : (RAMP_CODES[level] ?? 32)
    }
    const text = this.decoder.decode(buffer)
    if (text === this.rowCache[y]) return
    this.rowCache[y] = text
    const node = this.rowNodes[y]
    if (node) node.data = text
  }

  private ensureOverlay() {
    if (this.overlay) return
    const overlay = this.pre.cloneNode(false) as HTMLPreElement
    overlay.removeAttribute("id")
    overlay.classList.add("ascii-art-fx")
    overlay.setAttribute("aria-hidden", "true")
    this.rowNodes = []
    this.rowCache = []
    for (let y = 0; y < this.grid.rows; y++) {
      const line = document.createElement("span")
      const text = document.createTextNode("")
      line.append(text)
      overlay.append(line)
      this.rowNodes.push(text)
      this.rowCache.push("")
    }
    this.overlay = overlay
    this.dirty = [0, this.grid.rows - 1]
    this.frame.append(overlay)
    this.setState("live")
  }

  private park() {
    this.unsubscribe?.()
    this.unsubscribe = null
    this.fps = 0
    this.overlay?.remove()
    this.overlay = null
    this.dirty = null
    this.setState("idle")
  }

  private setState(state: FxState) {
    this.frame.dataset.fx = state
  }
}

const surfaces = new WeakMap<HTMLElement, AsciiSurface>()

export function getSurface(frame: HTMLElement): AsciiSurface | null {
  const existing = surfaces.get(frame)
  if (existing) return existing
  const pre = frame.querySelector<HTMLElement>(":scope > pre.ascii-art")
  const cols = Number(frame.dataset.cols)
  const rows = Number(frame.dataset.rows)
  if (!pre?.firstChild || !cols || !rows) return null
  const surface = new AsciiSurface(frame, pre, cols, rows)
  surfaces.set(frame, surface)
  return surface
}
