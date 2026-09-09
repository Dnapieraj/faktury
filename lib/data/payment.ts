import 'server-only'
import { prisma } from '@/lib/prisma'

/** Minimal, non-sensitive invoice data for the public payment page. */
export async function getInvoiceForPayment(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: {
      id: true,
      number: true,
      status: true,
      currency: true,
      totalGross: true,
      dueDate: true,
      paidAt: true,
      paymentUrl: true,
      user: { select: { company: { select: { name: true } } } },
    },
  })
  if (!invoice) return null

  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    currency: invoice.currency,
    totalGross: Number(invoice.totalGross),
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    paymentUrl: invoice.paymentUrl,
    sellerName: invoice.user.company?.name ?? 'Wystawca faktury',
  }
}
