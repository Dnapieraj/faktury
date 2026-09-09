import type { Metadata } from 'next'
import { requireCompany } from '@/lib/auth'
import { ComingSoon } from '../_components/coming-soon'

export const metadata: Metadata = { title: 'Faktury cykliczne' }

export default async function RecurringPage() {
  await requireCompany()
  return (
    <ComingSoon
      title="Faktury cykliczne"
      description="Szablony, które co miesiąc wystawiają się automatycznie."
    />
  )
}
