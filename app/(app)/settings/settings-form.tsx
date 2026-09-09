'use client'

import { useActionState } from 'react'
import { updateCompanyAction, type CompanyFormState } from './actions'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'

export type CompanyFormValues = {
  name: string
  taxId?: string | null
  addressLine?: string | null
  postalCode?: string | null
  city?: string | null
  email?: string | null
  phone?: string | null
  iban?: string | null
  invoicePrefix: string
  paymentTermDays: number
  defaultVatRate: number | string
}

export function SettingsForm({ values }: { values: CompanyFormValues }) {
  const [state, action] = useActionState<CompanyFormState, FormData>(updateCompanyAction, {})
  const fe = state.fieldErrors

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}

      <Card>
        <CardHeader>
          <CardTitle>Dane firmy</CardTitle>
          <CardDescription>Pojawią się na każdej fakturze jako sprzedawca.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field className="sm:col-span-2" label="Nazwa" htmlFor="name" required error={fe?.name}>
            <Input id="name" name="name" defaultValue={values.name} aria-invalid={Boolean(fe?.name)} />
          </Field>
          <Field label="NIP" htmlFor="taxId" error={fe?.taxId}>
            <Input
              id="taxId"
              name="taxId"
              inputMode="numeric"
              defaultValue={values.taxId ?? ''}
              aria-invalid={Boolean(fe?.taxId)}
            />
          </Field>
          <Field label="E-mail" htmlFor="email" error={fe?.email}>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={values.email ?? ''}
              aria-invalid={Boolean(fe?.email)}
            />
          </Field>
          <Field className="sm:col-span-2" label="Adres" htmlFor="addressLine" error={fe?.addressLine}>
            <Input
              id="addressLine"
              name="addressLine"
              defaultValue={values.addressLine ?? ''}
              placeholder="ul. Przykładowa 1/2"
              aria-invalid={Boolean(fe?.addressLine)}
            />
          </Field>
          <Field label="Kod pocztowy" htmlFor="postalCode" error={fe?.postalCode}>
            <Input
              id="postalCode"
              name="postalCode"
              defaultValue={values.postalCode ?? ''}
              placeholder="00-000"
              aria-invalid={Boolean(fe?.postalCode)}
            />
          </Field>
          <Field label="Miejscowość" htmlFor="city" error={fe?.city}>
            <Input id="city" name="city" defaultValue={values.city ?? ''} aria-invalid={Boolean(fe?.city)} />
          </Field>
          <Field label="Telefon" htmlFor="phone" error={fe?.phone}>
            <Input id="phone" name="phone" defaultValue={values.phone ?? ''} aria-invalid={Boolean(fe?.phone)} />
          </Field>
          <Field
            label="Numer konta (IBAN)"
            htmlFor="iban"
            error={fe?.iban}
            hint="Trafi na fakturę i do płatności."
          >
            <Input
              id="iban"
              name="iban"
              defaultValue={values.iban ?? ''}
              placeholder="PL61 1090 1014 0000 0712 1981 2874"
              aria-invalid={Boolean(fe?.iban)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Domyślne ustawienia faktur</CardTitle>
          <CardDescription>Podstawiane przy tworzeniu nowej faktury.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Prefiks numeru"
            htmlFor="invoicePrefix"
            error={fe?.invoicePrefix}
            hint="np. FV → FV/2026/0001"
          >
            <Input
              id="invoicePrefix"
              name="invoicePrefix"
              defaultValue={values.invoicePrefix}
              aria-invalid={Boolean(fe?.invoicePrefix)}
            />
          </Field>
          <Field label="Termin płatności (dni)" htmlFor="paymentTermDays" error={fe?.paymentTermDays}>
            <Input
              id="paymentTermDays"
              name="paymentTermDays"
              type="number"
              min={0}
              max={365}
              defaultValue={values.paymentTermDays}
              aria-invalid={Boolean(fe?.paymentTermDays)}
            />
          </Field>
          <Field label="Domyślny VAT (%)" htmlFor="defaultVatRate" error={fe?.defaultVatRate}>
            <Input
              id="defaultVatRate"
              name="defaultVatRate"
              type="number"
              min={0}
              max={100}
              step="0.01"
              defaultValue={String(values.defaultVatRate)}
              aria-invalid={Boolean(fe?.defaultVatRate)}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <SubmitButton>Zapisz ustawienia</SubmitButton>
      </div>
    </form>
  )
}
