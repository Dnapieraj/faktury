import 'server-only'
import { prisma } from '@/lib/prisma'
import { addDays } from '@/lib/date'
import { advanceRun } from '@/lib/recurring'
import { createInvoice } from '@/lib/invoice-create'
import { issueAndSendInvoice } from '@/lib/invoice-issue'

/** Issue one invoice from a recurring template and advance its schedule. */
export async function issueRecurringInvoice(recurringId: string, now: Date = new Date()) {
  const rec = await prisma.recurringInvoice.findUnique({
    where: { id: recurringId },
    include: { items: { orderBy: { position: 'asc' } } },
  })
  if (!rec) throw new Error('Nie znaleziono szablonu.')

  const issueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)

  const invoice = await createInvoice(rec.userId, {
    clientId: rec.clientId,
    issueDate,
    saleDate: issueDate,
    dueDate: addDays(issueDate, rec.paymentTermDays),
    notes: rec.notes,
    recurringInvoiceId: rec.id,
    items: rec.items.map((it) => ({
      name: it.name,
      quantity: Number(it.quantity),
      unitPriceNet: Number(it.unitPriceNet),
      vatRate: Number(it.vatRate),
    })),
  })

  const send = await issueAndSendInvoice(invoice.id)

  await prisma.recurringInvoice.update({
    where: { id: rec.id },
    data: { lastRunAt: now, nextRunAt: advanceRun(rec.nextRunAt, rec.dayOfMonth) },
  })

  return { invoiceId: invoice.id, number: invoice.number, sent: send.ok }
}

/** Process every due recurring template. */
export async function runRecurringJob(now: Date = new Date()) {
  const due = await prisma.recurringInvoice.findMany({
    where: { status: 'ACTIVE', nextRunAt: { lte: now } },
    select: { id: true, endDate: true },
  })

  const issued: { id: string; number: string }[] = []
  const errors: string[] = []
  let paused = 0

  for (const rec of due) {
    if (rec.endDate && rec.endDate < now) {
      await prisma.recurringInvoice.update({ where: { id: rec.id }, data: { status: 'PAUSED' } })
      paused += 1
      continue
    }
    try {
      const res = await issueRecurringInvoice(rec.id, now)
      issued.push({ id: res.invoiceId, number: res.number })
    } catch (error) {
      console.error(`[cron/recurring] ${rec.id} failed`, error)
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`${rec.id}: ${message}`)
    }
  }

  return { checked: due.length, issued: issued.length, invoices: issued, paused, errors }
}
