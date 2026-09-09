import 'server-only'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { InvoiceStatus, Prisma } from '@/lib/generated/prisma/client'

export type InvoiceListParams = {
  search?: string
  status?: InvoiceStatus
  clientId?: string
}

export async function listInvoices(userId: string, params: InvoiceListParams = {}) {
  const search = params.search?.trim()

  const where: Prisma.InvoiceWhereInput = {
    userId,
    ...(params.status ? { status: params.status } : {}),
    ...(params.clientId ? { clientId: params.clientId } : {}),
    ...(search
      ? {
          OR: [
            { number: { contains: search, mode: 'insensitive' } },
            { client: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }

  return prisma.invoice.findMany({
    where,
    orderBy: [{ issueDate: 'desc' }, { number: 'desc' }],
    select: {
      id: true,
      number: true,
      status: true,
      issueDate: true,
      dueDate: true,
      paidAt: true,
      totalGross: true,
      currency: true,
      client: { select: { id: true, name: true } },
    },
  })
}

export const getInvoiceById = cache(async (userId: string, id: string) => {
  return prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      items: { orderBy: { position: 'asc' } },
      client: true,
    },
  })
})

export async function getInvoiceOr404(userId: string, id: string) {
  const invoice = await getInvoiceById(userId, id)
  if (!invoice) notFound()
  return invoice
}

export async function getInvoiceStats(userId: string) {
  const [awaiting, overdue, paidThisMonth] = await Promise.all([
    prisma.invoice.aggregate({
      where: { userId, status: { in: ['SENT', 'OVERDUE'] } },
      _sum: { totalGross: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { userId, status: 'OVERDUE' },
      _sum: { totalGross: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: {
        userId,
        status: 'PAID',
        paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { totalGross: true },
      _count: true,
    }),
  ])

  return { awaiting, overdue, paidThisMonth }
}
