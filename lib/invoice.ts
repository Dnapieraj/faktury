import { round2 } from '@/lib/money'

export type InvoiceItemInput = {
  name: string
  quantity: number
  unitPriceNet: number
  vatRate: number
}

export type ComputedLine = InvoiceItemInput & {
  net: number
  vat: number
  gross: number
}

export type VatBreakdownRow = {
  rate: number
  net: number
  vat: number
  gross: number
}

export type InvoiceTotals = {
  lines: ComputedLine[]
  vatBreakdown: VatBreakdownRow[]
  totalNet: number
  totalVat: number
  totalGross: number
}

export function computeLine(item: InvoiceItemInput): ComputedLine {
  const net = round2(item.quantity * item.unitPriceNet)
  const vat = round2((net * item.vatRate) / 100)
  return { ...item, net, vat, gross: round2(net + vat) }
}

export function computeInvoiceTotals(items: InvoiceItemInput[]): InvoiceTotals {
  const lines = items.map(computeLine)

  const byRate = new Map<number, VatBreakdownRow>()
  for (const line of lines) {
    const row = byRate.get(line.vatRate) ?? { rate: line.vatRate, net: 0, vat: 0, gross: 0 }
    row.net = round2(row.net + line.net)
    row.vat = round2(row.vat + line.vat)
    row.gross = round2(row.gross + line.gross)
    byRate.set(line.vatRate, row)
  }

  const vatBreakdown = [...byRate.values()].sort((a, b) => b.rate - a.rate)

  return {
    lines,
    vatBreakdown,
    totalNet: round2(vatBreakdown.reduce((s, r) => s + r.net, 0)),
    totalVat: round2(vatBreakdown.reduce((s, r) => s + r.vat, 0)),
    totalGross: round2(vatBreakdown.reduce((s, r) => s + r.gross, 0)),
  }
}

/** `FV/2026/0007` from its parts. */
export function formatInvoiceNumber(prefix: string, year: number, seq: number): string {
  return `${prefix}/${year}/${String(seq).padStart(4, '0')}`
}

/** Highest sequence already used among `numbers` matching `${prefix}/${year}/`. */
export function highestSequence(numbers: string[], prefix: string, year: number): number {
  const head = `${prefix}/${year}/`
  return numbers.reduce((max, n) => {
    if (!n.startsWith(head)) return max
    const seq = Number.parseInt(n.slice(head.length), 10)
    return Number.isFinite(seq) && seq > max ? seq : max
  }, 0)
}
