/** Days in the month of the given year (1-12). */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * The next run date on or after `from` that falls on `dayOfMonth`
 * (clamped to the length of the month). Time set to 06:00 local.
 */
export function computeNextRun(from: Date, dayOfMonth: number): Date {
  const year = from.getFullYear()
  const month = from.getMonth()

  const candidateDay = Math.min(dayOfMonth, daysInMonth(year, month))
  let next = new Date(year, month, candidateDay, 6, 0, 0, 0)

  if (next < from) {
    const nextDay = Math.min(dayOfMonth, daysInMonth(year, month + 1))
    next = new Date(year, month + 1, nextDay, 6, 0, 0, 0)
  }
  return next
}

/** The run date after `current` (advance by one month). */
export function advanceRun(current: Date, dayOfMonth: number): Date {
  const day = Math.min(dayOfMonth, daysInMonth(current.getFullYear(), current.getMonth() + 1))
  return new Date(current.getFullYear(), current.getMonth() + 1, day, 6, 0, 0, 0)
}
