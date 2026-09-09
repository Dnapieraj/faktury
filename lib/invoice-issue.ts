import 'server-only'
import { prisma } from '@/lib/prisma'
import { isStripeEnabled } from '@/lib/stripe'
import { createInvoiceCheckoutSession } from '@/lib/payments'
import { emailInvoiceToClient } from '@/lib/email/invoices'
import { onInvoiceSent } from '@/lib/notifications'

export type IssueResult = { ok: true; emailed: boolean } | { ok: false; error: string }

/**
 * Issue an invoice to its client: ensure a Stripe payment link, e-mail the PDF +
 * link, move DRAFT -> SENT. Shared by the manual "Wyślij" action and the
 * recurring-invoices cron.
 */
export async function issueAndSendInvoice(invoiceId: string): Promise<IssueResult> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
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
  if (!invoice) return { ok: false, error: 'Nie znaleziono faktury.' }
  if (invoice.status === 'PAID') return { ok: false, error: 'Faktura jest już opłacona.' }
  if (!invoice.client.email) {
    return { ok: false, error: 'Klient nie ma adresu e-mail.' }
  }

  let paymentUrl = invoice.paymentUrl
  let stripeSessionId = invoice.stripeSessionId
  if (isStripeEnabled && !paymentUrl) {
    try {
      const session = await createInvoiceCheckoutSession({
        id: invoice.id,
        number: invoice.number,
        currency: invoice.currency,
        totalGross: Number(invoice.totalGross),
        clientEmail: invoice.client.email,
      })
      paymentUrl = session.url
      stripeSessionId = session.sessionId
    } catch (error) {
      console.error('[stripe] checkout session failed', error)
      return { ok: false, error: 'Nie udało się utworzyć linku do płatności.' }
    }
  }

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      paymentUrl,
      stripeSessionId,
      status: invoice.status === 'DRAFT' ? 'SENT' : invoice.status,
      sentAt: new Date(),
    },
  })

  const email = await emailInvoiceToClient(invoice.id)
  await onInvoiceSent(invoice.id)

  if (!email.ok && !email.skipped) return { ok: false, error: email.error }
  return { ok: true, emailed: email.ok }
}
