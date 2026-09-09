import 'server-only'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/lib/generated/prisma/client'

export type ClientListParams = {
  search?: string
  includeArchived?: boolean
}

export async function listClients(userId: string, params: ClientListParams = {}) {
  const search = params.search?.trim()

  const where: Prisma.ClientWhereInput = {
    userId,
    ...(params.includeArchived ? {} : { archived: false }),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { taxId: { contains: search.replace(/\D/g, '') } },
          ],
        }
      : {}),
  }

  return prisma.client.findMany({
    where,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      taxId: true,
      email: true,
      city: true,
      archived: true,
      _count: { select: { invoices: true } },
    },
  })
}

export const getClientById = cache(async (userId: string, id: string) => {
  return prisma.client.findFirst({
    where: { id, userId },
    include: {
      _count: { select: { invoices: true, recurringInvoices: true } },
    },
  })
})

/** Like {@link getClientById} but triggers notFound() when missing. */
export async function getClientOr404(userId: string, id: string) {
  const client = await getClientById(userId, id)
  if (!client) notFound()
  return client
}
