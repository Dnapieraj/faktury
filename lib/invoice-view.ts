import { computeInvoiceTotals, type ComputedLine, type VatBreakdownRow } from '@/lib/invoice'

type InvoiceRecord = {
  number: string
  issueDate: Date
  saleDate: Date
  dueDate: Date
  currency: string
  notes: string | null
  buyerName: string | null
  buyerTaxId: string | null
  buyerAddressLine: string | null
  buyerPostalCode: string | null
  buyerCity: string | null
  items: {
    name: string
    quantity: unknown
    unitPriceNet: unknown
    vatRate: unknown
  }[]
  client: {
    name: string
    taxId: string | null
    addressLine: string | null
    postalCode: string | null
    city: string | null
  }
}

type CompanyRecord = {
  name: string
  taxId: string | null
  addressLine: string | null
  postalCode: string | null
  city: string | null
  iban: string | null
}

export type InvoiceView = {
  number: string
  issueDate: Date
  saleDate: Date
  dueDate: Date
  currency: string
  notes: string | null
  seller: CompanyRecord
  sellerIban: string | null
  buyer: {
    name: string
    taxId: string | null
    addressLine: string | null
    postalCode: string | null
    city: string | null
  }
  lines: ComputedLine[]
  vatBreakdown: VatBreakdownRow[]
  totalNet: number
  totalVat: number
  totalGross: number
}

/** Everything the detail view, the PDF and the e-mail need from an invoice. */
export function buildInvoiceView(invoice: InvoiceRecord, company: CompanyRecord): InvoiceView {
  const totals = computeInvoiceTotals(
    invoice.items.map((it) => ({
      name: it.name,
      quantity: Number(it.quantity),
      unitPriceNet: Number(it.unitPriceNet),
      vatRate: Number(it.vatRate),
    })),
  )

  return {
    number: invoice.number,
    issueDate: invoice.issueDate,
    saleDate: invoice.saleDate,
    dueDate: invoice.dueDate,
    currency: invoice.currency,
    notes: invoice.notes,
    seller: company,
    sellerIban: company.iban,
    buyer: {
      name: invoice.buyerName ?? invoice.client.name,
      taxId: invoice.buyerTaxId ?? invoice.client.taxId,
      addressLine: invoice.buyerAddressLine ?? invoice.client.addressLine,
      postalCode: invoice.buyerPostalCode ?? invoice.client.postalCode,
      city: invoice.buyerCity ?? invoice.client.city,
    },
    lines: totals.lines,
    vatBreakdown: totals.vatBreakdown,
    totalNet: totals.totalNet,
    totalVat: totals.totalVat,
    totalGross: totals.totalGross,
  }
}
