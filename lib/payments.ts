import 'server-only'
import { requireStripe } from '@/lib/stripe'
import { getBaseUrl } from '@/lib/url'

type CheckoutInvoice = {
  id: string
  number: string
  currency: string
  totalGross: number
  clientEmail?: string | null
}

/**
 * Create (or reuse) a Stripe Checkout session for an invoice. Returns the
 * hosted payment page URL and the session id to persist on the invoice.
 */
export async function createInvoiceCheckoutSession(invoice: CheckoutInvoice) {
  const stripe = requireStripe()
  const base = getBaseUrl()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: 'pl',
    customer_email: invoice.clientEmail ?? undefined,
    client_reference_id: invoice.id,
    metadata: { invoiceId: invoice.id, invoiceNumber: invoice.number },
    payment_intent_data: {
      metadata: { invoiceId: invoice.id, invoiceNumber: invoice.number },
      description: `Faktura ${invoice.number}`,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: invoice.currency.toLowerCase(),
          unit_amount: Math.round(invoice.totalGross * 100),
          product_data: { name: `Faktura ${invoice.number}` },
        },
      },
    ],
    success_url: `${base}/pay/${invoice.id}?status=success`,
    cancel_url: `${base}/pay/${invoice.id}?status=cancel`,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h (Stripe min)
  })

  return { sessionId: session.id, url: session.url }
}

export async function expireCheckoutSession(sessionId: string) {
  const stripe = requireStripe()
  try {
    await stripe.checkout.sessions.expire(sessionId)
  } catch {
    // already expired / completed — nothing to do
  }
}
