'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireCompany } from '@/lib/auth'
import { formToObject } from '@/lib/form'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma/client'
import { computeNextRun } from '@/lib/recurring'
import { issueRecurringInvoice } from '@/lib/jobs/recurring'
import { recurringSchema } from '@/lib/validations/recurring'

export type RecurringFormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

function parseForm(formData: FormData) {
  const raw = formToObject(formData)
  return recurringSchema.safeParse({ ...raw, endDate: raw.endDate || undefined })
}

export async function saveRecurringAction(
  _prev: RecurringFormState,
  formData: FormData,
): Promise<RecurringFormState> {
  const { user } = await requireCompany()
  const id = (formData.get('id') as string) || null

  const parsed = parseForm(formData)
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }
  const input = parsed.data

  const client = await prisma.client.findFirst({
    where: { id: input.clientId, userId: user.id },
    select: { id: true },
  })
  if (!client) return { fieldErrors: { clientId: ['Nie znaleziono klienta'] } }

  const nextRunAt = computeNextRun(
    input.startDate > new Date() ? input.startDate : new Date(),
    input.dayOfMonth,
  )

  const itemRows = input.items.map((it, position) => ({
    name: it.name,
    quantity: new Prisma.Decimal(it.quantity),
    unitPriceNet: new Prisma.Decimal(it.unitPriceNet),
    vatRate: new Prisma.Decimal(it.vatRate),
    position,
  }))

  const common = {
    clientId: input.clientId,
    dayOfMonth: input.dayOfMonth,
    paymentTermDays: input.paymentTermDays,
    startDate: input.startDate,
    endDate: input.endDate ?? null,
    notes: input.notes ?? null,
  }

  let recurringId: string
  if (id) {
    const existing = await prisma.recurringInvoice.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    })
    if (!existing) return { error: 'Nie znaleziono szablonu.' }
    await prisma.recurringInvoice.update({
      where: { id },
      data: { ...common, nextRunAt, items: { deleteMany: {}, create: itemRows } },
    })
    recurringId = id
  } else {
    const created = await prisma.recurringInvoice.create({
      data: { ...common, userId: user.id, nextRunAt, items: { create: itemRows } },
      select: { id: true },
    })
    recurringId = created.id
  }

  revalidatePath('/recurring')
  redirect(`/recurring/${recurringId}?toast=${id ? 'recurring-updated' : 'recurring-created'}`)
}

export async function setRecurringStatusAction(id: string, status: 'ACTIVE' | 'PAUSED') {
  const { user } = await requireCompany()
  const rec = await prisma.recurringInvoice.findFirst({
    where: { id, userId: user.id },
    select: { id: true, dayOfMonth: true },
  })
  if (!rec) return { error: 'Nie znaleziono szablonu.' }

  await prisma.recurringInvoice.update({
    where: { id },
    data: {
      status,
      ...(status === 'ACTIVE' ? { nextRunAt: computeNextRun(new Date(), rec.dayOfMonth) } : {}),
    },
  })
  revalidatePath('/recurring')
  revalidatePath(`/recurring/${id}`)
  return { ok: true }
}

export async function deleteRecurringAction(id: string) {
  const { user } = await requireCompany()
  const rec = await prisma.recurringInvoice.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })
  if (!rec) return { error: 'Nie znaleziono szablonu.' }

  await prisma.recurringInvoice.delete({ where: { id } })
  revalidatePath('/recurring')
  redirect('/recurring?toast=recurring-deleted')
}

/** Manually issue an invoice from the template now (does not change the schedule cadence beyond advancing nextRunAt). */
export async function runRecurringNowAction(id: string) {
  const { user } = await requireCompany()
  const rec = await prisma.recurringInvoice.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })
  if (!rec) return { error: 'Nie znaleziono szablonu.' }

  try {
    const res = await issueRecurringInvoice(rec.id)
    revalidatePath('/recurring')
    revalidatePath(`/recurring/${id}`)
    revalidatePath('/invoices')
    revalidatePath('/dashboard')
    return { ok: true, number: res.number, invoiceId: res.invoiceId }
  } catch (error) {
    console.error('[recurring] manual run failed', error)
    return { error: 'Nie udało się wystawić faktury.' }
  }
}
