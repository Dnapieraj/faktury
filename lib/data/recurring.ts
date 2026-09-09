import 'server-only'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function listRecurring(userId: string) {
  return prisma.recurringInvoice.findMany({
    where: { userId },
    orderBy: [{ status: 'asc' }, { nextRunAt: 'asc' }],
    select: {
      id: true,
      status: true,
      dayOfMonth: true,
      nextRunAt: true,
      endDate: true,
      client: { select: { id: true, name: true } },
      items: { select: { quantity: true, unitPriceNet: true, vatRate: true } },
      _count: { select: { invoices: true } },
    },
  })
}

export const getRecurringById = cache(async (userId: string, id: string) => {
  return prisma.recurringInvoice.findFirst({
    where: { id, userId },
    include: {
      client: true,
      items: { orderBy: { position: 'asc' } },
      invoices: {
        orderBy: { issueDate: 'desc' },
        take: 12,
        select: {
          id: true,
          number: true,
          status: true,
          issueDate: true,
          dueDate: true,
          totalGross: true,
          currency: true,
        },
      },
    },
  })
})

export async function getRecurringOr404(userId: string, id: string) {
  const rec = await getRecurringById(userId, id)
  if (!rec) notFound()
  return rec
}
