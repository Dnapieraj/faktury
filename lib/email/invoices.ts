import 'server-only'
import { prisma } from '@/lib/prisma'
import { getBaseUrl } from '@/lib/url'
import { daysBetween } from '@/lib/date'
import { buildInvoiceView } from '@/lib/invoice-view'
import { renderInvoicePdf } from '@/lib/pdf/render-invoice'
import { invoicePdfFilename } from '@/lib/pdf/render-invoice'
import { EMAIL_FROM, isEmailEnabled, resend } from './client'
import { InvoiceIssuedEmail, InvoicePaidEmail, InvoiceReminderEmail } from './templates'

export type EmailResult = { ok: true } | { ok: false; skipped?: boolean; error: string }

const invoiceInclude = {
  items: { orderBy: { position: 'asc' as const } },
  client: true,
  user: { select: { email: true, company: true } },
}

async function loadInvoice(invoiceId: string) {
  return prisma.invoice.findUnique({ where: { id: invoiceId }, include: invoiceInclude })
}

function payUrlFor(invoiceId: string, stored: string | null) {
  return stored || `${getBaseUrl()}/pay/${invoiceId}`
}

async function pdfAttachment(invoice: NonNullable<Awaited<ReturnType<typeof loadInvoice>>>) {
  if (!invoice.user.company) return null
  const view = buildInvoiceView(invoice, invoice.user.company)
  const buffer = await renderInvoicePdf({
    number: view.number,
    issueDate: view.issueDate,
    saleDate: view.saleDate,
    dueDate: view.dueDate,
    currency: view.currency,
    seller: view.seller,
    sellerIban: view.sellerIban,
    buyer: view.buyer,
    lines: view.lines,
    vatBreakdown: view.vatBreakdown,
    totalNet: view.totalNet,
    totalVat: view.totalVat,
    totalGross: view.totalGross,
    notes: view.notes,
  })
  return { filename: invoicePdfFilename(view.number), content: buffer.toString('base64') }
}

/** Send the issued invoice (PDF + pay link) to the client. */
export async function emailInvoiceToClient(invoiceId: string): Promise<EmailResult> {
  const invoice = await loadInvoice(invoiceId)
  if (!invoice || !invoice.user.company) return { ok: false, error: 'Nie znaleziono faktury.' }
  if (!invoice.client.email) {
    return { ok: false, error: 'Klient nie ma adresu e-mail. Uzupełnij go i spróbuj ponownie.' }
  }
  if (!isEmailEnabled || !resend) return { ok: false, skipped: true, error: 'E-mail wyłączony.' }

  const attachment = await pdfAttachment(invoice)

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: invoice.client.email,
    subject: `Faktura ${invoice.number} od ${invoice.user.company.name}`,
    react: InvoiceIssuedEmail({
      number: invoice.number,
      sellerName: invoice.user.company.name,
      clientName: invoice.client.name,
      totalGross: Number(invoice.totalGross),
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      payUrl: payUrlFor(invoice.id, invoice.paymentUrl),
    }),
    attachments: attachment ? [attachment] : undefined,
  })

  if (error) {
    console.error('[email] invoice issued failed', error)
    return { ok: false, error: 'Nie udało się wysłać wiadomości.' }
  }
  return { ok: true }
}

/** Notify the invoice owner that it has been paid. */
export async function emailPaymentConfirmation(invoiceId: string): Promise<EmailResult> {
  const invoice = await loadInvoice(invoiceId)
  if (!invoice || !invoice.user.company) return { ok: false, error: 'Nie znaleziono faktury.' }
  if (!isEmailEnabled || !resend) return { ok: false, skipped: true, error: 'E-mail wyłączony.' }

  const to = invoice.user.company.email || invoice.user.email
  if (!to) return { ok: false, error: 'Brak adresu e-mail właściciela.' }

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Opłacono fakturę ${invoice.number}`,
    react: InvoicePaidEmail({
      number: invoice.number,
      clientName: invoice.client.name,
      totalGross: Number(invoice.totalGross),
      currency: invoice.currency,
      paidAt: invoice.paidAt ?? new Date(),
      invoiceUrl: `${getBaseUrl()}/invoices/${invoice.id}`,
    }),
  })

  if (error) {
    console.error('[email] payment confirmation failed', error)
    return { ok: false, error: 'Nie udało się wysłać potwierdzenia.' }
  }
  return { ok: true }
}

/** Send an overdue reminder to the client. */
export async function emailOverdueReminder(invoiceId: string): Promise<EmailResult> {
  const invoice = await loadInvoice(invoiceId)
  if (!invoice || !invoice.user.company) return { ok: false, error: 'Nie znaleziono faktury.' }
  if (!invoice.client.email) return { ok: false, error: 'Klient nie ma adresu e-mail.' }
  if (!isEmailEnabled || !resend) return { ok: false, skipped: true, error: 'E-mail wyłączony.' }

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: invoice.client.email,
    subject: `Przypomnienie: faktura ${invoice.number} po terminie`,
    react: InvoiceReminderEmail({
      number: invoice.number,
      sellerName: invoice.user.company.name,
      clientName: invoice.client.name,
      totalGross: Number(invoice.totalGross),
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      payUrl: payUrlFor(invoice.id, invoice.paymentUrl),
      daysOverdue: Math.max(daysBetween(invoice.dueDate, new Date()), 0),
    }),
  })

  if (error) {
    console.error('[email] reminder failed', error)
    return { ok: false, error: 'Nie udało się wysłać przypomnienia.' }
  }
  return { ok: true }
}
