'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireCompany } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, type InvoiceStatus } from '@/lib/generated/prisma/client'
import { computeInvoiceTotals } from '@/lib/invoice'
import { createInvoice } from '@/lib/invoice-create'
import { invoiceSchema } from '@/lib/validations/invoice'
import { isStripeEnabled } from '@/lib/stripe'
import { createInvoiceCheckoutSession } from '@/lib/payments'
import { issueAndSendInvoice } from '@/lib/invoice-issue'
import { emailOverdueReminder } from '@/lib/email/invoices'

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
  const { user } = await requireCompany()
  const id = (formData.get('id') as string) || null

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const input = parsed.data

  let invoiceId: string
  let isNew = false

  if (id) {
    const existing = await prisma.invoice.findFirst({
      where: { id, userId: user.id },
      select: { id: true, status: true, clientId: true },
    })
    if (!existing) return { error: 'Nie znaleziono faktury.' }
    if (existing.status !== 'DRAFT') {
      return { error: 'Edytować można tylko szkice. Cofnij fakturę do szkicu, aby ją zmienić.' }
    }

    const client = await prisma.client.findFirst({
      where: { id: input.clientId, userId: user.id },
    })
    if (!client) return { fieldErrors: { clientId: ['Nie znaleziono klienta'] } }

    const totals = computeInvoiceTotals(input.items)
    await prisma.invoice.update({
      where: { id },
      data: {
        clientId: input.clientId,
        issueDate: input.issueDate,
        saleDate: input.saleDate,
        dueDate: input.dueDate,
        notes: input.notes,
        buyerName: client.name,
        buyerTaxId: client.taxId,
        buyerAddressLine: client.addressLine,
        buyerCity: client.city,
        buyerPostalCode: client.postalCode,
        totalNet: new Prisma.Decimal(totals.totalNet),
        totalVat: new Prisma.Decimal(totals.totalVat),
        totalGross: new Prisma.Decimal(totals.totalGross),
        items: {
          deleteMany: {},
          create: totals.lines.map((line, position) => ({
            name: line.name,
            quantity: new Prisma.Decimal(line.quantity),
            unitPriceNet: new Prisma.Decimal(line.unitPriceNet),
            vatRate: new Prisma.Decimal(line.vatRate),
            position,
          })),
        },
      },
    })
    invoiceId = id
  } else {
    isNew = true
    try {
      const created = await createInvoice(user.id, {
        clientId: input.clientId,
        issueDate: input.issueDate,
        saleDate: input.saleDate,
        dueDate: input.dueDate,
        notes: input.notes,
        items: input.items,
      })
      invoiceId = created.id
    } catch (error) {
      console.error('[invoices] create failed', error)
      return { error: 'Nie udało się zapisać faktury. Spróbuj ponownie.' }
    }
  }

  revalidatePath('/invoices')
  revalidatePath(`/invoices/${invoiceId}`)
  revalidatePath('/dashboard')
  redirect(`/invoices/${invoiceId}?toast=${isNew ? 'invoice-created' : 'invoice-updated'}`)
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
 * Issue the invoice: create the payment link (if Stripe is on), e-mail the
 * client the PDF + link, and move DRAFT -> SENT.
 */
export async function sendInvoiceAction(id: string) {
  const { user } = await requireCompany()
  const owned = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })
  if (!owned) return { error: 'Nie znaleziono faktury.' }

  const res = await issueAndSendInvoice(id)

  revalidatePath('/invoices')
  revalidatePath(`/invoices/${id}`)
  revalidatePath('/dashboard')

  if (!res.ok) return { error: res.error }
  return res.emailed ? { ok: true } : { ok: true, emailSkipped: true }
}

/**
 * Send an overdue reminder e-mail for a SENT/OVERDUE invoice.
 */
export async function sendReminderAction(id: string) {
  const { user } = await requireCompany()
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    select: { id: true, status: true },
  })
  if (!invoice) return { error: 'Nie znaleziono faktury.' }
  if (invoice.status !== 'SENT' && invoice.status !== 'OVERDUE') {
    return { error: 'Przypomnienie można wysłać tylko dla wystawionej faktury.' }
  }

  const res = await emailOverdueReminder(invoice.id)
  if (!res.ok) return res.skipped ? { ok: true, emailSkipped: true } : { error: res.error }
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
