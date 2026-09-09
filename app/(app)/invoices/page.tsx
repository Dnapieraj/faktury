import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Plus } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { listInvoices } from '@/lib/data/invoices'
import { formatMoney } from '@/lib/money'
import { formatDate } from '@/lib/date'
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
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge'
import { cn } from '@/lib/utils'
import type { InvoiceStatus } from '@/lib/generated/prisma/client'
import { InvoicesToolbar } from './_components/invoices-toolbar'

export const metadata: Metadata = { title: 'Faktury' }

const VALID_STATUSES: InvoiceStatus[] = ['DRAFT', 'SENT', 'PAID', 'OVERDUE']

export default async function InvoicesPage({ searchParams }: PageProps<'/invoices'>) {
  const { user } = await requireCompany()
  const params = await searchParams

  const search = typeof params.q === 'string' ? params.q : undefined
  const statusParam = typeof params.status === 'string' ? params.status : undefined
  const status = VALID_STATUSES.find((s) => s === statusParam)

  const invoices = await listInvoices(user.id, { search, status })
  const isFiltering = Boolean(search || status)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Faktury"
        description="Wszystkie faktury Twojej firmy."
        actions={
          <Link href="/invoices/new" className={cn(buttonVariants())}>
            <Plus />
            Nowa faktura
          </Link>
        }
      />

      <InvoicesToolbar />

      {invoices.length === 0 ? (
        isFiltering ? (
          <EmptyState icon={FileText} title="Brak faktur dla wybranych filtrów" />
        ) : (
          <EmptyState
            icon={FileText}
            title="Nie masz jeszcze faktur"
            description="Wystaw pierwszą fakturę — numer nada się automatycznie."
            action={
              <Link href="/invoices/new" className={cn(buttonVariants())}>
                <Plus />
                Nowa faktura
              </Link>
            }
          />
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numer</TableHead>
              <TableHead>Klient</TableHead>
              <TableHead className="hidden sm:table-cell">Wystawiono</TableHead>
              <TableHead className="hidden md:table-cell">Termin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Brutto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer">
                <TableCell className="font-medium">
                  <Link href={`/invoices/${inv.id}`} className="hover:text-primary hover:underline">
                    {inv.number}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{inv.client.name}</TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell">
                  {formatDate(inv.issueDate)}
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  {formatDate(inv.dueDate)}
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
    </div>
  )
}
