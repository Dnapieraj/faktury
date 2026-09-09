import { describe, expect, it } from 'vitest'
import { formatIban, isValidIban, normalizeIban } from './iban'

describe('normalizeIban', () => {
  it('removes spaces and upper-cases', () => {
    expect(normalizeIban('pl61 1090 1014 0000 0712 1981 2874')).toBe('PL61109010140000071219812874')
  })
})

describe('isValidIban', () => {
  it('accepts a valid PL IBAN', () => {
    expect(isValidIban('PL61 1090 1014 0000 0712 1981 2874')).toBe(true)
  })
  it('accepts a valid DE IBAN', () => {
    expect(isValidIban('DE89 3704 0044 0532 0130 00')).toBe(true)
  })
  it('rejects a bad checksum or malformed input', () => {
    expect(isValidIban('PL61 1090 1014 0000 0712 1981 2875')).toBe(false)
    expect(isValidIban('PL00')).toBe(false)
    expect(isValidIban('not an iban')).toBe(false)
  })
})

describe('formatIban', () => {
  it('groups into blocks of 4', () => {
    expect(formatIban('PL61109010140000071219812874')).toBe('PL61 1090 1014 0000 0712 1981 2874')
  })
})
