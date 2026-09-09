const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatDate(value: Date | string): string {
  return dateFormatter.format(typeof value === 'string' ? new Date(value) : value)
}

/** `YYYY-MM-DD` in local time — for <input type="date"> defaults. */
export function toDateInputValue(value: Date | string = new Date()): string {
  const d = typeof value === 'string' ? new Date(value) : value
  const tzOffset = d.getTimezoneOffset() * 60_000
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10)
}

export function addDays(value: Date, days: number): Date {
  const d = new Date(value)
  d.setDate(d.getDate() + days)
  return d
}

/** Whole days from `a` to `b` (b - a), positive when b is later. */
export function daysBetween(a: Date, b: Date): number {
  const day = 86_400_000
  const truncate = (d: Date) => Math.floor(d.getTime() / day)
  return truncate(b) - truncate(a)
}

export function isPastDue(dueDate: Date, reference: Date = new Date()): boolean {
  return daysBetween(reference, dueDate) < 0
}
