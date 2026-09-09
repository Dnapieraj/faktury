import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { onInvoicePaid } from '@/lib/notifications'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return new Response('Webhook not configured', { status: 500 })

  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing signature', { status: 400 })

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = Stripe.webhooks.constructEvent(body, signature, secret)
  } catch (error) {
    console.error('[stripe] signature verification failed', error)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        if (session.payment_status === 'paid') {
          await markInvoicePaid(
            session.metadata?.invoiceId ?? session.client_reference_id,
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
          )
        }
        break
      }
      case 'checkout.session.expired': {
        const session = event.data.object
        const invoiceId = session.metadata?.invoiceId ?? session.client_reference_id
        if (invoiceId) {
          await prisma.invoice.updateMany({
            where: { id: invoiceId, stripeSessionId: session.id, status: { not: 'PAID' } },
            data: { stripeSessionId: null, paymentUrl: null },
          })
        }
        break
      }
    }
  } catch (error) {
    console.error(`[stripe] handler failed for ${event.type}`, error)
    return new Response('Handler error', { status: 500 })
  }

  return new Response('ok')
}

async function markInvoicePaid(
  invoiceId: string | null | undefined,
  paymentIntentId: string | null,
) {
  if (!invoiceId) return

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, status: true },
  })
  if (!invoice || invoice.status === 'PAID') return

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntentId,
    },
  })

  await onInvoicePaid(invoice.id)
}
