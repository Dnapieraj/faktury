import type { Metadata } from 'next'
import { requireCompany } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Panel' }

export default async function DashboardPage() {
  const { company } = await requireCompany()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cześć, {company.name} 👋</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Twój panel. Klienci, faktury i przychody pojawią się tutaj.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>W budowie</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Kolejne kroki: CRUD klientów i faktur, PDF, płatności Stripe, faktury cykliczne.
        </CardContent>
      </Card>
    </div>
  )
}
