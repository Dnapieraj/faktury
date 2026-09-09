import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Download } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { getInvoiceOr404 } from '@/lib/data/invoices'
import { buildInvoiceView } from '@/lib/invoice-view'
import { isStripeEnabled } from '@/lib/stripe'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { InvoiceDocument } from '@/components/invoices/invoice-document'
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge'
import { PaymentPanel } from '@/components/invoices/payment-panel'
import { cn } from '@/lib/utils'
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
  const view = buildInvoiceView(invoice, company)

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
        actions={
          <>
            <a
              href={`/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noopener"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <Download />
              PDF
            </a>
            <InvoiceActions id={invoice.id} status={invoice.status} />
          </>
        }
      />

      {invoice.status !== 'PAID' || invoice.paymentUrl ? (
        <PaymentPanel
          invoiceId={invoice.id}
          status={invoice.status}
          paymentUrl={invoice.paymentUrl}
          stripeEnabled={isStripeEnabled}
        />
      ) : null}

      <InvoiceDocument
        number={view.number}
        issueDate={view.issueDate}
        saleDate={view.saleDate}
        dueDate={view.dueDate}
        currency={view.currency}
        seller={view.seller}
        sellerIban={view.sellerIban}
        buyer={view.buyer}
        lines={view.lines}
        vatBreakdown={view.vatBreakdown}
        totalNet={view.totalNet}
        totalVat={view.totalVat}
        totalGross={view.totalGross}
        notes={view.notes}
      />
    </div>
  )
}
