import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, Clock, Plus, TrendingUp, Wallet } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import {
  getInvoiceStats,
  getMonthlyRevenue,
  getOverdueInvoices,
  getRecentInvoices,
} from '@/lib/data/invoices'
import { formatMoney } from '@/lib/money'
import { formatDate } from '@/lib/date'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { StatCard } from '@/components/dashboard/stat-card'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Panel' }

export default async function DashboardPage() {
  const { user, company } = await requireCompany()

  const [stats, revenue, recent, overdue] = await Promise.all([
    getInvoiceStats(user.id),
    getMonthlyRevenue(user.id, 6),
    getRecentInvoices(user.id, 5),
    getOverdueInvoices(user.id, 5),
  ])

  const hasAnything = recent.length > 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Cześć, ${company.name}`}
        description="Przegląd Twoich rozliczeń."
        actions={
          <Link href="/invoices/new" className={cn(buttonVariants())}>
            <Plus />
            Nowa faktura
          </Link>
        }
      />

      {!hasAnything ? (
        <EmptyState
          icon={TrendingUp}
          title="Zacznij od pierwszej faktury"
          description="Gdy wystawisz faktury, zobaczysz tu przychód, kwoty do zapłaty i zaległości."
          action={
            <Link href="/invoices/new" className={cn(buttonVariants())}>
              <Plus />
              Nowa faktura
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Do zapłaty"
              value={formatMoney(stats.awaiting.total)}
              hint={`${stats.awaiting.count} ${plural(stats.awaiting.count, 'faktura', 'faktury', 'faktur')}`}
              icon={Wallet}
              tone="primary"
            />
            <StatCard
              label="Zaległe"
              value={formatMoney(stats.overdue.total)}
              hint={`${stats.overdue.count} po terminie`}
              icon={AlertTriangle}
              tone={stats.overdue.count > 0 ? 'danger' : 'default'}
            />
            <StatCard
              label="Opłacone w tym miesiącu"
              value={formatMoney(stats.paidThisMonth.total)}
              hint={`${stats.paidThisMonth.count} ${plural(stats.paidThisMonth.count, 'faktura', 'faktury', 'faktur')}`}
              icon={Clock}
            />
            <StatCard
              label="Przychód w tym roku"
              value={formatMoney(stats.paidThisYear.total)}
              icon={TrendingUp}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Przychód (ostatnie 6 miesięcy)</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenue} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Ostatnie faktury</CardTitle>
                <Link
                  href="/invoices"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
                >
                  Wszystkie
                  <ArrowRight className="size-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-border divide-y">
                  {recent.map((inv) => (
                    <li key={inv.id}>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="hover:bg-surface-muted/50 flex items-center justify-between gap-3 px-5 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{inv.number}</p>
                          <p className="text-muted-foreground truncate text-xs">
                            {inv.client.name}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <InvoiceStatusBadge status={inv.status} dueDate={inv.dueDate} />
                          <span className="text-sm font-medium tabular-nums">
                            {formatMoney(inv.totalGross.toString(), inv.currency)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wymaga uwagi</CardTitle>
              </CardHeader>
              <CardContent className={overdue.length === 0 ? '' : 'p-0'}>
                {overdue.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Brak faktur po terminie. Tak trzymaj.
                  </p>
                ) : (
                  <ul className="divide-border divide-y">
                    {overdue.map((inv) => (
                      <li key={inv.id}>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="hover:bg-surface-muted/50 flex items-center justify-between gap-3 px-5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{inv.number}</p>
                            <p className="text-danger truncate text-xs">
                              Termin: {formatDate(inv.dueDate)}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-medium tabular-nums">
                            {formatMoney(inv.totalGross.toString(), inv.currency)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
