import 'server-only'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma/client'
import {
  computeInvoiceTotals,
  formatInvoiceNumber,
  highestSequence,
  type InvoiceItemInput,
} from '@/lib/invoice'

export type NewInvoiceInput = {
  clientId: string
  issueDate: Date
  saleDate: Date
  dueDate: Date
  notes?: string | null
  items: InvoiceItemInput[]
  recurringInvoiceId?: string
}

/**
 * Create an invoice for a user: assigns the next `PREFIX/YYYY/NNNN` number
 * (retrying on the unique collision), snapshots the buyer and caches totals.
 */
export async function createInvoice(userId: string, input: NewInvoiceInput) {
  const [client, company] = await Promise.all([
    prisma.client.findFirst({ where: { id: input.clientId, userId } }),
    prisma.company.findUnique({ where: { userId } }),
  ])
  if (!client) throw new Error('Nie znaleziono klienta.')
  if (!company) throw new Error('Brak profilu firmy.')

  const totals = computeInvoiceTotals(input.items)
  const data = {
    userId,
    clientId: input.clientId,
    issueDate: input.issueDate,
    saleDate: input.saleDate,
    dueDate: input.dueDate,
    notes: input.notes ?? null,
    currency: 'PLN',
    recurringInvoiceId: input.recurringInvoiceId ?? null,
    buyerName: client.name,
    buyerTaxId: client.taxId,
    buyerAddressLine: client.addressLine,
    buyerCity: client.city,
    buyerPostalCode: client.postalCode,
    totalNet: new Prisma.Decimal(totals.totalNet),
    totalVat: new Prisma.Decimal(totals.totalVat),
    totalGross: new Prisma.Decimal(totals.totalGross),
    items: {
      create: totals.lines.map((line, position) => ({
        name: line.name,
        quantity: new Prisma.Decimal(line.quantity),
        unitPriceNet: new Prisma.Decimal(line.unitPriceNet),
        vatRate: new Prisma.Decimal(line.vatRate),
        position,
      })),
    },
  }

  const year = input.issueDate.getFullYear()
  for (let attempt = 0; attempt < 4; attempt++) {
    const used = await prisma.invoice.findMany({
      where: { userId, number: { startsWith: `${company.invoicePrefix}/${year}/` } },
      select: { number: true },
    })
    const number = formatInvoiceNumber(
      company.invoicePrefix,
      year,
      highestSequence(
        used.map((u) => u.number),
        company.invoicePrefix,
        year,
      ) + 1,
    )
    try {
      const created = await prisma.invoice.create({
        data: { ...data, number },
        select: { id: true, number: true },
      })
      return created
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') continue
      throw error
    }
  }
  throw new Error('Nie udało się nadać numeru faktury.')
}
