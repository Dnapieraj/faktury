import 'server-only'
import { emailPaymentConfirmation } from '@/lib/email/invoices'

/** Side effects to run when an invoice becomes paid (Stripe webhook / manual). */
export async function onInvoicePaid(invoiceId: string): Promise<void> {
  const res = await emailPaymentConfirmation(invoiceId)
  if (!res.ok && !res.skipped) {
    console.error(`[notifications] payment confirmation for ${invoiceId}: ${res.error}`)
  }
}

/** Side effects when an invoice is issued/sent to the client. */
export async function onInvoiceSent(invoiceId: string): Promise<void> {
  console.info(`[notifications] invoice ${invoiceId} sent`)
}
