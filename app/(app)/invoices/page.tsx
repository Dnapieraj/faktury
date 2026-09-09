import type { Metadata } from 'next'
import { requireCompany } from '@/lib/auth'
import { ComingSoon } from '../_components/coming-soon'

export const metadata: Metadata = { title: 'Faktury' }

export default async function InvoicesPage() {
  await requireCompany()
  return <ComingSoon title="Faktury" description="Wystawiaj i wysyłaj faktury klientom." />
}
