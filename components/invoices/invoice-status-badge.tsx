import { Badge } from '@/components/ui/badge'
import { isPastDue } from '@/lib/date'
import type { InvoiceStatus } from '@/lib/generated/prisma/client'

const CONFIG: Record<
  InvoiceStatus,
  { label: string; variant: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' }
> = {
  DRAFT: { label: 'Szkic', variant: 'neutral' },
  SENT: { label: 'Wysłana', variant: 'primary' },
  PAID: { label: 'Opłacona', variant: 'success' },
  OVERDUE: { label: 'Zaległa', variant: 'danger' },
}

export function InvoiceStatusBadge({
  status,
  dueDate,
}: {
  status: InvoiceStatus
  dueDate?: Date | string
}) {
  // A SENT invoice past its due date is effectively overdue until the daily
  // cron flips the status.
  if (status === 'SENT' && dueDate && isPastDue(new Date(dueDate))) {
    return <Badge variant="warning">Po terminie</Badge>
  }
  const { label, variant } = CONFIG[status]
  return <Badge variant={variant}>{label}</Badge>
}
