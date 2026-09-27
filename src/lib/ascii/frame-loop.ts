/**
 * One requestAnimationFrame for every ASCII effect on the page (the books page has ~10 covers).
 * Each subscriber gets its own FPS cap; the loop stops entirely when nobody is subscribed.
 */
type Tick = (now: number, dt: number) => boolean | void // return false to unsubscribe

interface Subscriber {
  tick: Tick
  interval: number
  last: number
}

const subscribers = new Set<Subscriber>()
let handle = 0

function loop(now: number) {
  handle = 0
  for (const sub of subscribers) {
    const dt = now - sub.last
    // 1ms slack so a 30fps cap does not alias to 20fps on 60Hz displays
    if (dt < sub.interval - 1) continue
    sub.last = now
    if (sub.tick(now, dt) === false) subscribers.delete(sub)
  }
  if (subscribers.size) handle = requestAnimationFrame(loop)
}

export function subscribeFrame(tick: Tick, fps = 30): () => void {
  const sub: Subscriber = { tick, interval: 1000 / fps, last: -Infinity }
  subscribers.add(sub)
  if (!handle) handle = requestAnimationFrame(loop)
  return () => {
    subscribers.delete(sub)
    if (!subscribers.size && handle) {
      cancelAnimationFrame(handle)
      handle = 0
    }
  }
}
