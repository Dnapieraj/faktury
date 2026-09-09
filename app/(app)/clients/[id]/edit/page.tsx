import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { getClientOr404 } from '@/lib/data/clients'
import { PageHeader } from '@/components/ui/page-header'
import { ClientForm } from '../../_components/client-form'

export const metadata: Metadata = { title: 'Edycja klienta' }

export default async function EditClientPage({ params }: PageProps<'/clients/[id]/edit'>) {
  const { user } = await requireCompany()
  const { id } = await params
  const client = await getClientOr404(user.id, id)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href={`/clients/${client.id}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        {client.name}
      </Link>
      <PageHeader title="Edycja klienta" />
      <ClientForm
        cancelHref={`/clients/${client.id}`}
        values={{
          id: client.id,
          name: client.name,
          taxId: client.taxId,
          email: client.email,
          addressLine: client.addressLine,
          postalCode: client.postalCode,
          city: client.city,
          country: client.country,
          notes: client.notes,
        }}
      />
    </div>
  )
}
