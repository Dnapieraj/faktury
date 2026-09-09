'use client'

import { useActionState } from 'react'
import { createCompanyAction, type OnboardingState } from './actions'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'

export function OnboardingForm({ defaultName }: { defaultName?: string }) {
  const [state, action] = useActionState<OnboardingState, FormData>(createCompanyAction, {})

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field
        label="Nazwa firmy"
        htmlFor="name"
        error={state.fieldErrors?.name}
        hint="Będzie widoczna na fakturach jako sprzedawca."
      >
        <Input
          id="name"
          name="name"
          defaultValue={defaultName}
          autoFocus
          placeholder="Jan Kowalski / Twoja Firma sp. z o.o."
          aria-invalid={Boolean(state.fieldErrors?.name)}
        />
      </Field>
      <SubmitButton size="lg" className="w-full">
        Przejdź do panelu
      </SubmitButton>
    </form>
  )
}
