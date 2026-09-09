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

type StatBucket = { total: number; count: number }

function bucket(agg: { _sum: { totalGross: unknown }; _count: number }): StatBucket {
  return { total: Number(agg._sum.totalGross ?? 0), count: agg._count }
}

export async function getInvoiceStats(userId: string) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const yearStart = new Date(now.getFullYear(), 0, 1)

  const [awaiting, overdue, paidThisMonth, paidThisYear] = await Promise.all([
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
      where: { userId, status: 'PAID', paidAt: { gte: monthStart } },
      _sum: { totalGross: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { userId, status: 'PAID', paidAt: { gte: yearStart } },
      _sum: { totalGross: true },
      _count: true,
    }),
  ])

  return {
    awaiting: bucket(awaiting),
    overdue: bucket(overdue),
    paidThisMonth: bucket(paidThisMonth),
    paidThisYear: bucket(paidThisYear),
  }
}

export type MonthlyRevenuePoint = { month: string; label: string; total: number }

/** Paid-invoice totals bucketed by calendar month, oldest first. */
export async function getMonthlyRevenue(
  userId: string,
  months = 6,
): Promise<MonthlyRevenuePoint[]> {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

  const paid = await prisma.invoice.findMany({
    where: { userId, status: 'PAID', paidAt: { gte: from } },
    select: { paidAt: true, totalGross: true },
  })

  const monthFmt = new Intl.DateTimeFormat('pl-PL', { month: 'short' })
  const points: MonthlyRevenuePoint[] = []
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1)
    points.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: monthFmt.format(d),
      total: 0,
    })
  }
  const byKey = new Map(points.map((p) => [p.month, p]))
  for (const inv of paid) {
    if (!inv.paidAt) continue
    const key = `${inv.paidAt.getFullYear()}-${String(inv.paidAt.getMonth() + 1).padStart(2, '0')}`
    const point = byKey.get(key)
    if (point) point.total += Number(inv.totalGross)
  }
  return points
}

export async function getRecentInvoices(userId: string, take = 5) {
  return prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      number: true,
      status: true,
      issueDate: true,
      dueDate: true,
      totalGross: true,
      currency: true,
      client: { select: { name: true } },
    },
  })
}

export async function getOverdueInvoices(userId: string, take = 5) {
  return prisma.invoice.findMany({
    where: { userId, status: { in: ['OVERDUE', 'SENT'] }, dueDate: { lt: new Date() } },
    orderBy: { dueDate: 'asc' },
    take,
    select: {
      id: true,
      number: true,
      status: true,
      dueDate: true,
      totalGross: true,
      currency: true,
      client: { select: { name: true } },
    },
  })
}
