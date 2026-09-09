import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { getInvoiceOr404 } from '@/lib/data/invoices'
import { computeInvoiceTotals } from '@/lib/invoice'
import { PageHeader } from '@/components/ui/page-header'
import { InvoiceDocument } from '@/components/invoices/invoice-document'
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge'
import { InvoiceActions } from '../_components/invoice-actions'

export async function generateMetadata({ params }: PageProps<'/invoices/[id]'>): Promise<Metadata> {
  const { user } = await requireCompany()
  const { id } = await params
  const invoice = await getInvoiceOr404(user.id, id)
  return { title: invoice.number }
}

export default async function InvoiceDetailPage({ params }: PageProps<'/invoices/[id]'>) {
  const { user, company } = await requireCompany()
  const { id } = await params
  const invoice = await getInvoiceOr404(user.id, id)

  const { lines, vatBreakdown, totalNet, totalVat, totalGross } = computeInvoiceTotals(
    invoice.items.map((it) => ({
      name: it.name,
      quantity: Number(it.quantity),
      unitPriceNet: Number(it.unitPriceNet),
      vatRate: Number(it.vatRate),
    })),
  )

  const buyer = {
    name: invoice.buyerName ?? invoice.client.name,
    taxId: invoice.buyerTaxId ?? invoice.client.taxId,
    addressLine: invoice.buyerAddressLine ?? invoice.client.addressLine,
    postalCode: invoice.buyerPostalCode ?? invoice.client.postalCode,
    city: invoice.buyerCity ?? invoice.client.city,
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/invoices"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Faktury
      </Link>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            {invoice.number}
            <InvoiceStatusBadge status={invoice.status} dueDate={invoice.dueDate} />
          </span>
        }
        description={
          <>
            Klient:{' '}
            <Link href={`/clients/${invoice.clientId}`} className="text-primary hover:underline">
              {invoice.client.name}
            </Link>
          </>
        }
        actions={<InvoiceActions id={invoice.id} status={invoice.status} />}
      />

      <InvoiceDocument
        number={invoice.number}
        issueDate={invoice.issueDate}
        saleDate={invoice.saleDate}
        dueDate={invoice.dueDate}
        currency={invoice.currency}
        seller={{
          name: company.name,
          taxId: company.taxId,
          addressLine: company.addressLine,
          postalCode: company.postalCode,
          city: company.city,
        }}
        sellerIban={company.iban}
        buyer={buyer}
        lines={lines}
        vatBreakdown={vatBreakdown}
        totalNet={totalNet}
        totalVat={totalVat}
        totalGross={totalGross}
        notes={invoice.notes}
      />
    </div>
  )
}
