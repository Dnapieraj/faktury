import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { listClients } from '@/lib/data/clients'
import { formatNip } from '@/lib/nip'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { ClientsToolbar } from './_components/clients-toolbar'
import { ClientRowActions } from './_components/client-row-actions'

export const metadata: Metadata = { title: 'Klienci' }

export default async function ClientsPage({ searchParams }: PageProps<'/clients'>) {
  const { user } = await requireCompany()
  const params = await searchParams
  const search = typeof params.q === 'string' ? params.q : undefined
  const includeArchived = params.archived === '1'

  const clients = await listClients(user.id, { search, includeArchived })
  const isFiltering = Boolean(search) || includeArchived

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Klienci"
        description="Kontrahenci, dla których wystawiasz faktury."
        actions={
          <Link href="/clients/new" className={cn(buttonVariants())}>
            <Plus />
            Dodaj klienta
          </Link>
        }
      />

      <ClientsToolbar />

      {clients.length === 0 ? (
        isFiltering ? (
          <EmptyState
            icon={Users}
            title="Brak wyników"
            description="Zmień kryteria wyszukiwania lub wyczyść filtry."
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Nie masz jeszcze klientów"
            description="Dodaj pierwszego kontrahenta, żeby móc wystawić fakturę."
            action={
              <Link href="/clients/new" className={cn(buttonVariants())}>
                <Plus />
                Dodaj klienta
              </Link>
            }
          />
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
              <TableHead className="hidden sm:table-cell">NIP</TableHead>
              <TableHead className="hidden md:table-cell">E-mail</TableHead>
              <TableHead className="hidden lg:table-cell">Miejscowość</TableHead>
              <TableHead className="text-right">Faktury</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link
                    href={`/clients/${c.id}`}
                    className="hover:text-primary font-medium hover:underline"
                  >
                    {c.name}
                  </Link>
                  {c.archived ? (
                    <Badge variant="neutral" className="ml-2 align-middle">
                      Zarchiwizowany
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="text-muted-foreground hidden font-mono text-xs sm:table-cell">
                  {c.taxId ? formatNip(c.taxId) : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  {c.email ?? '—'}
                </TableCell>
                <TableCell className="text-muted-foreground hidden lg:table-cell">
                  {c.city ?? '—'}
                </TableCell>
                <TableCell className="text-right tabular-nums">{c._count.invoices}</TableCell>
                <TableCell>
                  <ClientRowActions
                    id={c.id}
                    archived={c.archived}
                    canDelete={c._count.invoices === 0}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
