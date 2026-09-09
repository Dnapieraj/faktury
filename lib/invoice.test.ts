import { describe, expect, it } from 'vitest'
import { computeInvoiceTotals, computeLine, formatInvoiceNumber, highestSequence } from './invoice'

describe('computeLine', () => {
  it('computes net / vat / gross per line', () => {
    expect(computeLine({ name: 'x', quantity: 6, unitPriceNet: 350, vatRate: 23 })).toEqual({
      name: 'x',
      quantity: 6,
      unitPriceNet: 350,
      vatRate: 23,
      net: 2100,
      vat: 483,
      gross: 2583,
    })
  })
})

describe('computeInvoiceTotals', () => {
  it('sums lines and totals', () => {
    const t = computeInvoiceTotals([
      { name: 'A', quantity: 1, unitPriceNet: 8000, vatRate: 23 },
      { name: 'B', quantity: 6, unitPriceNet: 350, vatRate: 23 },
    ])
    expect(t.totalNet).toBe(10100)
    expect(t.totalVat).toBe(2323)
    expect(t.totalGross).toBe(12423)
  })

  it('groups the VAT breakdown by rate, descending', () => {
    const t = computeInvoiceTotals([
      { name: 'A', quantity: 1, unitPriceNet: 100, vatRate: 23 },
      { name: 'B', quantity: 1, unitPriceNet: 100, vatRate: 8 },
      { name: 'C', quantity: 2, unitPriceNet: 100, vatRate: 23 },
    ])
    expect(t.vatBreakdown.map((r) => r.rate)).toEqual([23, 8])
    expect(t.vatBreakdown[0]).toMatchObject({ rate: 23, net: 300, vat: 69, gross: 369 })
    expect(t.vatBreakdown[1]).toMatchObject({ rate: 8, net: 100, vat: 8, gross: 108 })
  })

  it('handles a zero-VAT line', () => {
    const t = computeInvoiceTotals([{ name: 'A', quantity: 1, unitPriceNet: 500, vatRate: 0 }])
    expect(t.totalVat).toBe(0)
    expect(t.totalGross).toBe(500)
  })
})

describe('invoice numbering', () => {
  it('formats a zero-padded number', () => {
    expect(formatInvoiceNumber('FV', 2026, 7)).toBe('FV/2026/0007')
    expect(formatInvoiceNumber('FV', 2026, 1234)).toBe('FV/2026/1234')
  })

  it('finds the highest used sequence for the year/prefix', () => {
    const nums = ['FV/2026/0001', 'FV/2026/0009', 'FV/2025/0100', 'INV/2026/0003']
    expect(highestSequence(nums, 'FV', 2026)).toBe(9)
    expect(highestSequence(nums, 'FV', 2027)).toBe(0)
    expect(highestSequence([], 'FV', 2026)).toBe(0)
  })
})
