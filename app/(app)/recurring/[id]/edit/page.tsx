import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { getRecurringOr404 } from '@/lib/data/recurring'
import { listClients } from '@/lib/data/clients'
import { toDateInputValue } from '@/lib/date'
import { PageHeader } from '@/components/ui/page-header'
import { RecurringForm } from '../../_components/recurring-form'

export const metadata: Metadata = { title: 'Edycja szablonu' }

export default async function EditRecurringPage({ params }: PageProps<'/recurring/[id]/edit'>) {
  const { user, company } = await requireCompany()
  const { id } = await params
  const rec = await getRecurringOr404(user.id, id)
  const clients = await listClients(user.id, { includeArchived: true })

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href={`/recurring/${rec.id}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        {rec.client.name}
      </Link>
      <PageHeader title="Edycja szablonu" />
      <RecurringForm
        cancelHref={`/recurring/${rec.id}`}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        defaults={{
          vatRate: Number(company.defaultVatRate),
          paymentTermDays: company.paymentTermDays,
        }}
        values={{
          id: rec.id,
          clientId: rec.clientId,
          dayOfMonth: rec.dayOfMonth,
          paymentTermDays: rec.paymentTermDays,
          startDate: toDateInputValue(rec.startDate),
          endDate: rec.endDate ? toDateInputValue(rec.endDate) : '',
          notes: rec.notes,
          items: rec.items.map((it) => ({
            name: it.name,
            quantity: String(Number(it.quantity)),
            unitPriceNet: String(Number(it.unitPriceNet)),
            vatRate: String(Number(it.vatRate)),
          })),
        }}
      />
    </div>
  )
}
