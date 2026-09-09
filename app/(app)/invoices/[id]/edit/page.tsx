import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { requireCompany } from '@/lib/auth'
import { getInvoiceOr404 } from '@/lib/data/invoices'
import { listClients } from '@/lib/data/clients'
import { toDateInputValue } from '@/lib/date'
import { PageHeader } from '@/components/ui/page-header'
import { InvoiceForm } from '../../_components/invoice-form'

export const metadata: Metadata = { title: 'Edycja faktury' }

export default async function EditInvoicePage({ params }: PageProps<'/invoices/[id]/edit'>) {
  const { user, company } = await requireCompany()
  const { id } = await params
  const invoice = await getInvoiceOr404(user.id, id)

  if (invoice.status !== 'DRAFT') {
    redirect(`/invoices/${invoice.id}`)
  }

  const clients = await listClients(user.id, { includeArchived: true })

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href={`/invoices/${invoice.id}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        {invoice.number}
      </Link>
      <PageHeader title={`Edycja ${invoice.number}`} />
      <InvoiceForm
        cancelHref={`/invoices/${invoice.id}`}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        defaults={{
          vatRate: Number(company.defaultVatRate),
          paymentTermDays: company.paymentTermDays,
        }}
        values={{
          id: invoice.id,
          clientId: invoice.clientId,
          issueDate: toDateInputValue(invoice.issueDate),
          saleDate: toDateInputValue(invoice.saleDate),
          dueDate: toDateInputValue(invoice.dueDate),
          notes: invoice.notes,
          items: invoice.items.map((it) => ({
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
