import { describe, expect, it } from 'vitest'
import { formatNip, isValidNip, normalizeNip } from './nip'

describe('normalizeNip', () => {
  it('strips non-digits', () => {
    expect(normalizeNip('123-456-32-18')).toBe('1234563218')
    expect(normalizeNip(' 123 456 32 18 ')).toBe('1234563218')
  })
})

describe('isValidNip', () => {
  it('accepts valid NIPs (checksum ok)', () => {
    expect(isValidNip('1234563218')).toBe(true)
    expect(isValidNip('525-224-84-81')).toBe(true)
  })
  it('rejects wrong checksum / length', () => {
    expect(isValidNip('1234563219')).toBe(false)
    expect(isValidNip('5213870274')).toBe(false)
    expect(isValidNip('123')).toBe(false)
    expect(isValidNip('')).toBe(false)
  })
})

describe('formatNip', () => {
  it('groups 10 digits as xxx-xxx-xx-xx', () => {
    expect(formatNip('1234563218')).toBe('123-456-32-18')
  })
  it('leaves non-10-digit input untouched', () => {
    expect(formatNip('12345')).toBe('12345')
  })
})
