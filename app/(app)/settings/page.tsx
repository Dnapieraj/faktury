import type { Metadata } from 'next'
import { requireCompany } from '@/lib/auth'
import { ComingSoon } from '../_components/coming-soon'

export const metadata: Metadata = { title: 'Ustawienia' }

export default async function SettingsPage() {
  await requireCompany()
  return (
    <ComingSoon
      title="Ustawienia"
      description="Dane firmy, numer konta i domyślne ustawienia faktur."
    />
  )
}
