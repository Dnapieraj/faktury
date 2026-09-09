import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { getInvoiceForPayment } from '@/lib/data/payment'
import { formatMoney } from '@/lib/money'
import { formatDate, isPastDue } from '@/lib/date'
import { Logo } from '@/components/brand/logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Płatność faktury', robots: { index: false } }

export default async function PayPage({ params, searchParams }: PageProps<'/pay/[id]'>) {
  const { id } = await params
  const sp = await searchParams
  const outcome = typeof sp.status === 'string' ? sp.status : null

  const invoice = await getInvoiceForPayment(id)
  if (!invoice) notFound()

  const paid = invoice.status === 'PAID'
  const overdue = !paid && isPastDue(invoice.dueDate)

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <Logo />

      <div className="border-border bg-surface rounded-2xl border p-6 shadow-sm">
        <p className="text-muted-foreground text-sm">{invoice.sellerName} wystawił(a) fakturę</p>
        <p className="mt-1 text-xl font-semibold tracking-tight">{invoice.number}</p>

        <div className="border-border mt-6 flex items-end justify-between border-y py-4">
          <span className="text-muted-foreground text-sm">Do zapłaty</span>
          <span className="text-2xl font-semibold tabular-nums">
            {formatMoney(invoice.totalGross, invoice.currency)}
          </span>
        </div>

        <p className="text-muted-foreground mt-3 text-sm">
          Termin płatności: {formatDate(invoice.dueDate)}
          {overdue ? <span className="text-danger"> · po terminie</span> : null}
        </p>

        <div className="mt-6">
          {paid ? (
            <div className="bg-success/10 text-foreground flex items-center gap-2 rounded-md px-3 py-2.5 text-sm">
              <CheckCircle2 className="text-success size-4" />
              Faktura opłacona{invoice.paidAt ? ` ${formatDate(invoice.paidAt)}` : ''}. Dziękujemy!
            </div>
          ) : outcome === 'success' ? (
            <div className="bg-success/10 text-foreground flex items-center gap-2 rounded-md px-3 py-2.5 text-sm">
              <Clock className="text-success size-4" />
              Płatność przyjęta — księgujemy ją w tle. Możesz zamknąć tę stronę.
            </div>
          ) : invoice.paymentUrl ? (
            <>
              {outcome === 'cancel' ? (
                <p className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
                  <XCircle className="size-4" />
                  Płatność anulowana. Możesz spróbować ponownie.
                </p>
              ) : null}
              <a href={invoice.paymentUrl} className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
                Zapłać online
              </a>
              <p className="text-muted-foreground mt-3 text-center text-xs">
                Płatność obsługuje Stripe. Karta lub BLIK.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Link do płatności online nie jest jeszcze dostępny. Skontaktuj się z wystawcą faktury.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
