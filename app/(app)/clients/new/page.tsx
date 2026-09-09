import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireCompany } from '@/lib/auth'
import { PageHeader } from '@/components/ui/page-header'
import { ClientForm } from '../_components/client-form'

export const metadata: Metadata = { title: 'Nowy klient' }

export default async function NewClientPage() {
  await requireCompany()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href="/clients"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Klienci
      </Link>
      <PageHeader title="Nowy klient" description="Dane kontrahenta trafią na jego faktury." />
      <ClientForm />
    </div>
  )
}
