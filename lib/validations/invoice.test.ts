import { describe, expect, it } from 'vitest'
import { invoiceSchema } from './invoice'
import { clientSchema } from './client'

const baseInvoice = {
  clientId: 'c1',
  issueDate: '2026-09-09',
  saleDate: '2026-09-09',
  dueDate: '2026-09-23',
  notes: '',
  items: JSON.stringify([{ name: 'Usługa', quantity: '2', unitPriceNet: '100', vatRate: '23' }]),
}

describe('invoiceSchema', () => {
  it('parses a valid invoice and coerces items', () => {
    const res = invoiceSchema.safeParse(baseInvoice)
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.items[0]).toEqual({
        name: 'Usługa',
        quantity: 2,
        unitPriceNet: 100,
        vatRate: 23,
      })
      expect(res.data.issueDate).toBeInstanceOf(Date)
    }
  })

  it('rejects a due date before the issue date', () => {
    const res = invoiceSchema.safeParse({ ...baseInvoice, dueDate: '2026-09-01' })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.dueDate?.[0]).toMatch(/wcześniejszy/)
    }
  })

  it('rejects an empty item list', () => {
    const res = invoiceSchema.safeParse({ ...baseInvoice, items: '[]' })
    expect(res.success).toBe(false)
  })

  it('rejects a non-positive quantity', () => {
    const res = invoiceSchema.safeParse({
      ...baseInvoice,
      items: JSON.stringify([{ name: 'x', quantity: '0', unitPriceNet: '1', vatRate: '23' }]),
    })
    expect(res.success).toBe(false)
  })
})

describe('clientSchema', () => {
  it("turns '' into undefined and normalizes NIP", () => {
    const res = clientSchema.safeParse({
      name: 'Kontrahent',
      taxId: '123-456-32-18',
      email: '',
      city: '',
    })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.taxId).toBe('1234563218')
      expect(res.data.email).toBeUndefined()
      expect(res.data.country).toBe('PL')
    }
  })

  it('rejects an invalid NIP and postal code', () => {
    const res = clientSchema.safeParse({ name: 'X', taxId: '1112223334', postalCode: '12345' })
    expect(res.success).toBe(false)
  })
})
