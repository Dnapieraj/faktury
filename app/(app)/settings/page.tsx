import type { Metadata } from 'next'
import { requireCompany } from '@/lib/auth'
import { PageHeader } from '@/components/ui/page-header'
import { SettingsForm } from './settings-form'

export const metadata: Metadata = { title: 'Ustawienia' }

export default async function SettingsPage() {
  const { company } = await requireCompany()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Ustawienia" description="Dane firmy i domyślne ustawienia faktur." />
      <SettingsForm
        values={{
          name: company.name,
          taxId: company.taxId,
          addressLine: company.addressLine,
          postalCode: company.postalCode,
          city: company.city,
          email: company.email,
          phone: company.phone,
          iban: company.iban,
          invoicePrefix: company.invoicePrefix,
          paymentTermDays: company.paymentTermDays,
          defaultVatRate: company.defaultVatRate.toString(),
        }}
      />
    </div>
  )
}
