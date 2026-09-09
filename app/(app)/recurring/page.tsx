import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, RefreshCw } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { listRecurring } from '@/lib/data/recurring'
import { computeInvoiceTotals } from '@/lib/invoice'
import { formatMoney } from '@/lib/money'
import { formatDate } from '@/lib/date'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'
import { RecurringActions } from './_components/recurring-actions'

export const metadata: Metadata = { title: 'Faktury cykliczne' }

export default async function RecurringPage() {
  const { user } = await requireCompany()
  const templates = await listRecurring(user.id)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Faktury cykliczne"
        description="Szablony, które co miesiąc wystawiają i wysyłają fakturę automatycznie."
        actions={
          <Link href="/recurring/new" className={cn(buttonVariants())}>
            <Plus />
            Nowy szablon
          </Link>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="Brak szablonów cyklicznych"
          description="Ustaw abonament raz — faktura wystawi się i wyśle co miesiąc bez Twojego udziału."
          action={
            <Link href="/recurring/new" className={cn(buttonVariants())}>
              <Plus />
              Nowy szablon
            </Link>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Klient</TableHead>
              <TableHead className="hidden sm:table-cell">Kwota / mies.</TableHead>
              <TableHead>Najbliższe wystawienie</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-px" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((t) => {
              const { totalGross } = computeInvoiceTotals(
                t.items.map((it) => ({
                  name: '',
                  quantity: Number(it.quantity),
                  unitPriceNet: Number(it.unitPriceNet),
                  vatRate: Number(it.vatRate),
                })),
              )
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/recurring/${t.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {t.client.name}
                    </Link>
                    <span className="text-muted-foreground ml-2 text-xs">dzień {t.dayOfMonth}</span>
                  </TableCell>
                  <TableCell className="hidden tabular-nums sm:table-cell">
                    {formatMoney(totalGross)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.status === 'ACTIVE' ? formatDate(t.nextRunAt) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'ACTIVE' ? 'success' : 'neutral'}>
                      {t.status === 'ACTIVE' ? 'Aktywny' : 'Wstrzymany'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <RecurringActions id={t.id} status={t.status} variant="compact" />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
