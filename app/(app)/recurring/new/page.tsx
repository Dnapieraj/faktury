import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { listClients } from '@/lib/data/clients'
import { EmptyState } from '@/components/ui/empty-state'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'
import { RecurringForm } from '../_components/recurring-form'

export const metadata: Metadata = { title: 'Nowy szablon cykliczny' }

export default async function NewRecurringPage() {
  const { user, company } = await requireCompany()
  const clients = await listClients(user.id)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/recurring"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Faktury cykliczne
      </Link>
      <PageHeader title="Nowy szablon cykliczny" />
      {clients.length === 0 ? (
        <EmptyState
          title="Najpierw dodaj klienta"
          description="Szablon cykliczny musi być przypisany do klienta."
          action={
            <Link href="/clients/new" className={cn(buttonVariants())}>
              Dodaj klienta
            </Link>
          }
        />
      ) : (
        <RecurringForm
          clients={clients.map((c) => ({ id: c.id, name: c.name }))}
          defaults={{
            vatRate: Number(company.defaultVatRate),
            paymentTermDays: company.paymentTermDays,
          }}
        />
      )}
    </div>
  )
}
