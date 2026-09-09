/** Round to 2 decimals (grosze), avoiding binary float drift. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

const plnFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
})

const plainFormatter = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** `1234.5` -> `1 234,50 zł` */
export function formatMoney(value: number | string, currency = 'PLN'): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (currency === 'PLN') return plnFormatter.format(n)
  return `${plainFormatter.format(n)} ${currency}`
}

/** `1234.5` -> `1 234,50` (no currency symbol) */
export function formatAmount(value: number | string): string {
  return plainFormatter.format(typeof value === 'string' ? Number(value) : value)
}

/** `3` -> `3`, `1.5` -> `1,5` — trims trailing zeros, up to 3 decimals. */
export function formatQuantity(value: number | string): string {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 3 }).format(
    typeof value === 'string' ? Number(value) : value,
  )
}
