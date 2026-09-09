import { describe, expect, it } from 'vitest'
import { advanceRun, computeNextRun } from './recurring'

describe('computeNextRun', () => {
  it('returns this month when the day is still ahead', () => {
    const next = computeNextRun(new Date(2026, 0, 5), 15)
    expect(next.getFullYear()).toBe(2026)
    expect(next.getMonth()).toBe(0)
    expect(next.getDate()).toBe(15)
  })

  it('rolls to next month when the day has passed', () => {
    const next = computeNextRun(new Date(2026, 0, 20), 15)
    expect(next.getMonth()).toBe(1)
    expect(next.getDate()).toBe(15)
  })

  it('clamps to the last day of a short month', () => {
    const next = computeNextRun(new Date(2026, 1, 1), 31)
    expect(next.getMonth()).toBe(1)
    expect(next.getDate()).toBe(28) // Feb 2026
  })
})

describe('advanceRun', () => {
  it('moves forward one month', () => {
    const next = advanceRun(new Date(2026, 0, 15), 15)
    expect(next.getMonth()).toBe(1)
    expect(next.getDate()).toBe(15)
  })

  it('wraps across the year boundary', () => {
    const next = advanceRun(new Date(2026, 11, 10), 10)
    expect(next.getFullYear()).toBe(2027)
    expect(next.getMonth()).toBe(0)
  })
})
