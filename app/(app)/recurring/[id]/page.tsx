import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Pencil } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { getRecurringOr404 } from '@/lib/data/recurring'
import { computeInvoiceTotals } from '@/lib/invoice'
import { formatMoney, formatQuantity } from '@/lib/money'
import { formatDate } from '@/lib/date'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge'
import { cn } from '@/lib/utils'
import { RecurringActions } from '../_components/recurring-actions'

export async function generateMetadata({
  params,
}: PageProps<'/recurring/[id]'>): Promise<Metadata> {
  const { user } = await requireCompany()
  const { id } = await params
  const rec = await getRecurringOr404(user.id, id)
  return { title: `Cykliczne — ${rec.client.name}` }
}

export default async function RecurringDetailPage({ params }: PageProps<'/recurring/[id]'>) {
  const { user } = await requireCompany()
  const { id } = await params
  const rec = await getRecurringOr404(user.id, id)

  const totals = computeInvoiceTotals(
    rec.items.map((it) => ({
      name: it.name,
      quantity: Number(it.quantity),
      unitPriceNet: Number(it.unitPriceNet),
      vatRate: Number(it.vatRate),
    })),
  )

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/recurring"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Faktury cykliczne
      </Link>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            {rec.client.name}
            <Badge variant={rec.status === 'ACTIVE' ? 'success' : 'neutral'}>
              {rec.status === 'ACTIVE' ? 'Aktywny' : 'Wstrzymany'}
            </Badge>
          </span>
        }
        description={`Co miesiąc, dzień ${rec.dayOfMonth} · termin płatności ${rec.paymentTermDays} dni`}
        actions={
          <>
            <Link
              href={`/recurring/${rec.id}/edit`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <Pencil />
              Edytuj
            </Link>
            <RecurringActions id={rec.id} status={rec.status} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pozycje szablonu</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border text-muted-foreground border-b text-xs uppercase">
                  <th className="px-5 py-2.5 text-left font-medium">Nazwa</th>
                  <th className="px-3 py-2.5 text-right font-medium">Ilość</th>
                  <th className="px-3 py-2.5 text-right font-medium">Netto</th>
                  <th className="px-3 py-2.5 text-right font-medium">VAT</th>
                  <th className="px-5 py-2.5 text-right font-medium">Brutto</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {totals.lines.map((line, i) => (
                  <tr key={i}>
                    <td className="px-5 py-2.5">{line.name}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {formatQuantity(line.quantity)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{formatMoney(line.net)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {formatQuantity(line.vatRate)}%
                    </td>
                    <td className="px-5 py-2.5 text-right font-medium tabular-nums">
                      {formatMoney(line.gross)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Harmonogram</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Info
              label="Najbliższe wystawienie"
              value={rec.status === 'ACTIVE' ? formatDate(rec.nextRunAt) : 'wstrzymane'}
            />
            <Info
              label="Ostatnie wystawienie"
              value={rec.lastRunAt ? formatDate(rec.lastRunAt) : '—'}
            />
            <Info label="Początek" value={formatDate(rec.startDate)} />
            <Info label="Koniec" value={rec.endDate ? formatDate(rec.endDate) : 'bezterminowo'} />
            <div className="border-border flex justify-between border-t pt-3 font-semibold">
              <span>Brutto / miesiąc</span>
              <span className="tabular-nums">{formatMoney(totals.totalGross)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">
          Wystawione z tego szablonu ({rec.invoices.length})
        </h2>
        {rec.invoices.length === 0 ? (
          <EmptyState title="Jeszcze nic nie wystawiono" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numer</TableHead>
                <TableHead className="hidden sm:table-cell">Wystawiono</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Brutto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rec.invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {inv.number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    {formatDate(inv.issueDate)}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={inv.status} dueDate={inv.dueDate} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatMoney(inv.totalGross.toString(), inv.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
