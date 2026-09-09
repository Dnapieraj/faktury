import 'server-only'

/**
 * Side effects to run when an invoice becomes paid (Stripe webhook / manual).
 * Transactional e-mail is wired up in the Resend milestone — for now this just
 * logs so the flow is observable.
 */
export async function onInvoicePaid(invoiceId: string): Promise<void> {
  console.info(`[notifications] invoice ${invoiceId} marked as paid`)
}

/** Side effects when an invoice is issued/sent to the client. */
export async function onInvoiceSent(invoiceId: string): Promise<void> {
  console.info(`[notifications] invoice ${invoiceId} sent`)
}
