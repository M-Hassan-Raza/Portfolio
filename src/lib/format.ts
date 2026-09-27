/** Shared display formatters. Content dates are ISO strings stored in UTC. */

const medium = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
})
const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})
const monthDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  timeZone: "UTC",
})
const lahoreTime = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Karachi",
})

/** "Feb 1, 2026" */
export function formatDate(iso: string) {
  return medium.format(new Date(iso))
}

/** "Feb 2026" */
export function formatMonthYear(iso: string) {
  return monthYear.format(new Date(iso))
}

/** "Feb 01" */
export function formatMonthDay(iso: string) {
  return monthDay.format(new Date(iso))
}

/** "2026-02-01", for mono date columns. */
export function formatIsoDay(iso: string) {
  return iso.slice(0, 10)
}

export function yearOf(iso: string) {
  return iso.slice(0, 4)
}

/** "18 min" */
export function formatReadingTime(minutes: number) {
  return `${minutes} min`
}

/** Local time in Lahore, "21:04". */
export function formatLahoreTime(date: Date) {
  return lahoreTime.format(date)
}

/** "01", "02" ... for index columns that encode a real order. */
export function padIndex(index: number, width = 2) {
  return String(index).padStart(width, "0")
}

/** Groups items by a key while keeping first-seen order. */
export function groupBy<T>(items: readonly T[], key: (item: T) => string) {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const name = key(item)
    const group = groups.get(name)
    if (group) group.push(item)
    else groups.set(name, [item])
  }
  return [...groups]
}
