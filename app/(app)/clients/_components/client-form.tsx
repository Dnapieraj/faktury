'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { saveClientAction, type ClientFormState } from '../actions'
import { Alert } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export type ClientFormValues = {
  id?: string
  name?: string
  taxId?: string | null
  email?: string | null
  addressLine?: string | null
  postalCode?: string | null
  city?: string | null
  country?: string | null
  notes?: string | null
}

export function ClientForm({
  values,
  cancelHref = '/clients',
}: {
  values?: ClientFormValues
  cancelHref?: string
}) {
  const [state, action] = useActionState<ClientFormState, FormData>(saveClientAction, {})
  const fe = state.fieldErrors

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}
      {values?.id ? <input type="hidden" name="id" value={values.id} /> : null}

      <Card>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field className="sm:col-span-2" label="Nazwa" htmlFor="name" required error={fe?.name}>
            <Input
              id="name"
              name="name"
              defaultValue={values?.name ?? ''}
              autoFocus
              placeholder="Kontrahent sp. z o.o."
              aria-invalid={Boolean(fe?.name)}
            />
          </Field>

          <Field label="NIP" htmlFor="taxId" error={fe?.taxId} hint="10 cyfr">
            <Input
              id="taxId"
              name="taxId"
              inputMode="numeric"
              defaultValue={values?.taxId ?? ''}
              placeholder="1234563218"
              aria-invalid={Boolean(fe?.taxId)}
            />
          </Field>

          <Field label="E-mail" htmlFor="email" error={fe?.email}>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={values?.email ?? ''}
              placeholder="kontakt@kontrahent.pl"
              aria-invalid={Boolean(fe?.email)}
            />
          </Field>

          <Field
            className="sm:col-span-2"
            label="Adres"
            htmlFor="addressLine"
            error={fe?.addressLine}
          >
            <Input
              id="addressLine"
              name="addressLine"
              defaultValue={values?.addressLine ?? ''}
              placeholder="ul. Przykładowa 1/2"
              aria-invalid={Boolean(fe?.addressLine)}
            />
          </Field>

          <Field label="Kod pocztowy" htmlFor="postalCode" error={fe?.postalCode}>
            <Input
              id="postalCode"
              name="postalCode"
              defaultValue={values?.postalCode ?? ''}
              placeholder="00-000"
              aria-invalid={Boolean(fe?.postalCode)}
            />
          </Field>

          <Field label="Miejscowość" htmlFor="city" error={fe?.city}>
            <Input
              id="city"
              name="city"
              defaultValue={values?.city ?? ''}
              placeholder="Warszawa"
              aria-invalid={Boolean(fe?.city)}
            />
          </Field>

          <Field
            className="sm:col-span-2"
            label="Notatki"
            htmlFor="notes"
            error={fe?.notes}
            hint="Widoczne tylko dla Ciebie."
          >
            <Textarea
              id="notes"
              name="notes"
              defaultValue={values?.notes ?? ''}
              rows={3}
              aria-invalid={Boolean(fe?.notes)}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Link href={cancelHref} className={cn(buttonVariants({ variant: 'ghost' }))}>
          Anuluj
        </Link>
        <SubmitButton>{values?.id ? 'Zapisz zmiany' : 'Dodaj klienta'}</SubmitButton>
      </div>
    </form>
  )
}
