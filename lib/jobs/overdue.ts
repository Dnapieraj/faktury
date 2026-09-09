import 'server-only'
import { prisma } from '@/lib/prisma'
import { emailOverdueReminder } from '@/lib/email/invoices'

/**
 * Flip SENT invoices whose due date has passed to OVERDUE and e-mail the client
 * a reminder. Idempotent: only invoices still in SENT are touched.
 */
export async function runOverdueJob(now: Date = new Date()) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const due = await prisma.invoice.findMany({
    where: { status: 'SENT', dueDate: { lt: startOfToday } },
    select: { id: true },
  })

  let flipped = 0
  let reminded = 0
  const errors: string[] = []

  for (const { id } of due) {
    await prisma.invoice.update({ where: { id }, data: { status: 'OVERDUE' } })
    flipped += 1

    const res = await emailOverdueReminder(id)
    if (res.ok) reminded += 1
    else if (!res.skipped) errors.push(`${id}: ${res.error}`)
  }

  return { checked: due.length, flipped, reminded, errors }
}
