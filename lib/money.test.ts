import { describe, expect, it } from 'vitest'
import { formatAmount, formatMoney, formatQuantity, round2 } from './money'

const flat = (s: string) => s.replace(/\s/g, ' ')

describe('round2', () => {
  it('rounds to 2 decimals', () => {
    expect(round2(1.005)).toBe(1.01)
    expect(round2(2.675)).toBe(2.68)
    expect(round2(10.1 * 23)).toBe(232.3)
    expect(round2(0.1 + 0.2)).toBe(0.3)
  })
})

describe('formatMoney', () => {
  it('formats PLN with a thousands separator and symbol', () => {
    expect(flat(formatMoney(1234.5))).toBe('1 234,50 zł')
  })
  it('accepts a string amount', () => {
    expect(flat(formatMoney('9840'))).toBe('9 840,00 zł')
  })
  it('formats other currencies with a code suffix', () => {
    expect(flat(formatMoney(10, 'EUR'))).toBe('10,00 EUR')
  })
})

describe('formatAmount / formatQuantity', () => {
  it('formatAmount always shows 2 decimals, no symbol', () => {
    expect(formatAmount(5)).toBe('5,00')
    expect(flat(formatAmount(12345.6))).toBe('12 345,60')
  })
  it('formatQuantity trims trailing zeros', () => {
    expect(formatQuantity(3)).toBe('3')
    expect(formatQuantity(1.5)).toBe('1,5')
    expect(formatQuantity('8')).toBe('8')
  })
})
