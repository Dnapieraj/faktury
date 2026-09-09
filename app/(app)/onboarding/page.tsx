import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { OnboardingForm } from './onboarding-form'

export const metadata: Metadata = { title: 'Konfiguracja firmy' }

export default async function OnboardingPage() {
  const user = await requireUser()
  const company = await prisma.company.findUnique({ where: { userId: user.id } })
  if (company) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skonfigurujmy Twoją firmę</CardTitle>
          <CardDescription>
            Jeszcze jeden krok. Resztę danych (NIP, adres, numer konta) uzupełnisz później w
            ustawieniach.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm defaultName={user.name ?? undefined} />
        </CardContent>
      </Card>
    </div>
  )
}
