import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { listClients } from '@/lib/data/clients'
import { PageHeader } from '@/components/ui/page-header'
import { InvoiceForm } from '../_components/invoice-form'

export const metadata: Metadata = { title: 'Nowa faktura' }

export default async function NewInvoicePage() {
  const { user, company } = await requireCompany()
  const clients = await listClients(user.id)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/invoices"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Faktury
      </Link>
      <PageHeader
        title="Nowa faktura"
        description="Zapisz jako szkic — wyślesz ją w kolejnym kroku."
      />
      <InvoiceForm
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        defaults={{
          vatRate: Number(company.defaultVatRate),
          paymentTermDays: company.paymentTermDays,
        }}
      />
    </div>
  )
}
