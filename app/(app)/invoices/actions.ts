'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireCompany } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, type InvoiceStatus } from '@/lib/generated/prisma/client'
import { computeInvoiceTotals, formatInvoiceNumber, highestSequence } from '@/lib/invoice'
import { invoiceSchema } from '@/lib/validations/invoice'
import { isStripeEnabled } from '@/lib/stripe'
import { createInvoiceCheckoutSession } from '@/lib/payments'

export type InvoiceFormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

function parseForm(formData: FormData) {
  return invoiceSchema.safeParse({
    clientId: formData.get('clientId'),
    issueDate: formData.get('issueDate'),
    saleDate: formData.get('saleDate'),
    dueDate: formData.get('dueDate'),
    notes: formData.get('notes'),
    items: formData.get('items'),
  })
}

export async function saveInvoiceAction(
  _prev: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const { user, company } = await requireCompany()
  const id = (formData.get('id') as string) || null

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const input = parsed.data

  const client = await prisma.client.findFirst({
    where: { id: input.clientId, userId: user.id },
  })
  if (!client) return { fieldErrors: { clientId: ['Nie znaleziono klienta'] } }

  const totals = computeInvoiceTotals(input.items)
  const buyerSnapshot = {
    buyerName: client.name,
    buyerTaxId: client.taxId,
    buyerAddressLine: client.addressLine,
    buyerCity: client.city,
    buyerPostalCode: client.postalCode,
  }
  const itemRows = totals.lines.map((line, position) => ({
    name: line.name,
    quantity: new Prisma.Decimal(line.quantity),
    unitPriceNet: new Prisma.Decimal(line.unitPriceNet),
    vatRate: new Prisma.Decimal(line.vatRate),
    position,
  }))
  const money = {
    totalNet: new Prisma.Decimal(totals.totalNet),
    totalVat: new Prisma.Decimal(totals.totalVat),
    totalGross: new Prisma.Decimal(totals.totalGross),
  }

  let invoiceId: string
  let isNew = false

  if (id) {
    const existing = await prisma.invoice.findFirst({
      where: { id, userId: user.id },
      select: { id: true, status: true },
    })
    if (!existing) return { error: 'Nie znaleziono faktury.' }
    if (existing.status !== 'DRAFT') {
      return { error: 'Edytować można tylko szkice. Cofnij fakturę do szkicu, aby ją zmienić.' }
    }

    await prisma.invoice.update({
      where: { id },
      data: {
        clientId: input.clientId,
        issueDate: input.issueDate,
        saleDate: input.saleDate,
        dueDate: input.dueDate,
        notes: input.notes,
        ...buyerSnapshot,
        ...money,
        items: { deleteMany: {}, create: itemRows },
      },
    })
    invoiceId = id
  } else {
    isNew = true
    const year = input.issueDate.getFullYear()
    invoiceId = await createWithNumber(user.id, company.invoicePrefix, year, (number) =>
      prisma.invoice.create({
        data: {
          userId: user.id,
          clientId: input.clientId,
          number,
          issueDate: input.issueDate,
          saleDate: input.saleDate,
          dueDate: input.dueDate,
          notes: input.notes,
          currency: 'PLN',
          ...buyerSnapshot,
          ...money,
          items: { create: itemRows },
        },
        select: { id: true },
      }),
    )
  }

  revalidatePath('/invoices')
  revalidatePath(`/invoices/${invoiceId}`)
  revalidatePath('/dashboard')
  redirect(`/invoices/${invoiceId}?toast=${isNew ? 'invoice-created' : 'invoice-updated'}`)
}

/** Retry a few times on the unique [userId, number] collision under concurrency. */
async function createWithNumber(
  userId: string,
  prefix: string,
  year: number,
  create: (number: string) => Promise<{ id: string }>,
): Promise<string> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const used = await prisma.invoice.findMany({
      where: { userId, number: { startsWith: `${prefix}/${year}/` } },
      select: { number: true },
    })
    const number = formatInvoiceNumber(
      prefix,
      year,
      highestSequence(
        used.map((u) => u.number),
        prefix,
        year,
      ) + 1,
    )
    try {
      const created = await create(number)
      return created.id
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') continue
      throw error
    }
  }
  throw new Error('Nie udało się nadać numeru faktury. Spróbuj ponownie.')
}

const ALLOWED_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ['SENT'],
  SENT: ['PAID', 'DRAFT'],
  OVERDUE: ['PAID', 'DRAFT'],
  PAID: ['SENT'],
}

export async function setInvoiceStatusAction(id: string, next: InvoiceStatus) {
  const { user } = await requireCompany()
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    select: { status: true },
  })
  if (!invoice) return { error: 'Nie znaleziono faktury.' }
  if (!ALLOWED_TRANSITIONS[invoice.status].includes(next)) {
    return { error: 'Niedozwolona zmiana statusu.' }
  }

  const data: Prisma.InvoiceUpdateInput = { status: next }
  if (next === 'PAID') data.paidAt = new Date()
  if (next === 'SENT' && invoice.status === 'DRAFT') data.sentAt = new Date()
  if (next === 'DRAFT') {
    data.sentAt = null
    data.paidAt = null
  }
  if (next === 'SENT' && invoice.status === 'PAID') data.paidAt = null

  await prisma.invoice.update({ where: { id }, data })
  revalidatePath('/invoices')
  revalidatePath(`/invoices/${id}`)
  revalidatePath('/dashboard')
  return { ok: true }
}

/**
 * Ensure a Stripe payment link exists for the invoice. Creating one also moves
 * a DRAFT to SENT. Reuses an existing link unless it was already paid.
 */
export async function createPaymentLinkAction(id: string) {
  if (!isStripeEnabled) {
    return { error: 'Płatności online nie są skonfigurowane (brak kluczy Stripe).' }
  }

  const { user } = await requireCompany()
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      number: true,
      status: true,
      currency: true,
      totalGross: true,
      paymentUrl: true,
      stripeSessionId: true,
      client: { select: { email: true } },
    },
  })
  if (!invoice) return { error: 'Nie znaleziono faktury.' }
  if (invoice.status === 'PAID') return { error: 'Faktura jest już opłacona.' }

  if (invoice.paymentUrl && invoice.stripeSessionId) {
    return { ok: true, url: invoice.paymentUrl }
  }

  let session: { sessionId: string; url: string | null }
  try {
    session = await createInvoiceCheckoutSession({
      id: invoice.id,
      number: invoice.number,
      currency: invoice.currency,
      totalGross: Number(invoice.totalGross),
      clientEmail: invoice.client.email,
    })
  } catch (error) {
    console.error('[stripe] checkout session failed', error)
    return { error: 'Nie udało się utworzyć linku do płatności. Spróbuj ponownie.' }
  }

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      stripeSessionId: session.sessionId,
      paymentUrl: session.url,
      ...(invoice.status === 'DRAFT' ? { status: 'SENT', sentAt: new Date() } : {}),
    },
  })

  revalidatePath('/invoices')
  revalidatePath(`/invoices/${invoice.id}`)
  revalidatePath('/dashboard')
  return { ok: true, url: session.url }
}

export async function deleteInvoiceAction(id: string) {
  const { user } = await requireCompany()
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    select: { status: true },
  })
  if (!invoice) return { error: 'Nie znaleziono faktury.' }
  if (invoice.status !== 'DRAFT') {
    return { error: 'Usunąć można tylko szkic faktury.' }
  }

  await prisma.invoice.delete({ where: { id } })
  revalidatePath('/invoices')
  revalidatePath('/dashboard')
  redirect('/invoices?toast=invoice-deleted')
}
