import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeft, Pencil } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { getClientOr404 } from '@/lib/data/clients'
import { formatNip } from '@/lib/nip'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'
import { ClientRowActions } from '../_components/client-row-actions'

export async function generateMetadata({ params }: PageProps<'/clients/[id]'>): Promise<Metadata> {
  const { user } = await requireCompany()
  const { id } = await params
  const client = await getClientOr404(user.id, id)
  return { title: client.name }
}

function Row({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
      <dt className="text-muted-foreground w-40 shrink-0 text-sm">{label}</dt>
      <dd className="text-sm">{value || <span className="text-muted-foreground">—</span>}</dd>
    </div>
  )
}

export default async function ClientDetailPage({ params }: PageProps<'/clients/[id]'>) {
  const { user } = await requireCompany()
  const { id } = await params
  const client = await getClientOr404(user.id, id)

  const address = [client.addressLine, [client.postalCode, client.city].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/clients"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Klienci
      </Link>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {client.name}
            {client.archived ? <Badge variant="neutral">Zarchiwizowany</Badge> : null}
          </span>
        }
        actions={
          <>
            <Link
              href={`/clients/${client.id}/edit`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <Pencil />
              Edytuj
            </Link>
            <ClientRowActions
              id={client.id}
              archived={client.archived}
              canDelete={client._count.invoices === 0 && client._count.recurringInvoices === 0}
            />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dane kontrahenta</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-border divide-y">
              <Row label="Nazwa" value={client.name} />
              <Row label="NIP" value={client.taxId ? formatNip(client.taxId) : undefined} />
              <Row label="E-mail" value={client.email} />
              <Row label="Adres" value={address} />
              <Row label="Kraj" value={client.country} />
              <Row
                label="Notatki"
                value={
                  client.notes ? <p className="whitespace-pre-wrap">{client.notes}</p> : undefined
                }
              />
            </dl>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Podsumowanie</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Faktury</span>
              <span className="font-medium tabular-nums">{client._count.invoices}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Szablony cykliczne</span>
              <span className="font-medium tabular-nums">{client._count.recurringInvoices}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Faktury tego klienta</h2>
        <EmptyState
          title="Brak faktur"
          description="Faktury wystawione temu klientowi pojawią się tutaj."
        />
      </section>
    </div>
  )
}
