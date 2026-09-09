'use client'

import { useActionState } from 'react'
import { registerAction, type AuthFormState } from '@/app/(auth)/actions'
import { Alert } from '@/components/ui/alert'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'

export function RegisterForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(registerAction, {})

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}

      <Field
        label="Nazwa firmy"
        htmlFor="companyName"
        error={state.fieldErrors?.companyName}
        hint="Pojawi się na fakturach jako sprzedawca. Zmienisz ją w ustawieniach."
      >
        <Input
          id="companyName"
          name="companyName"
          autoComplete="organization"
          autoFocus
          placeholder="Jan Kowalski / Twoja Firma sp. z o.o."
          aria-invalid={Boolean(state.fieldErrors?.companyName)}
        />
      </Field>

      <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="jan@twojafirma.pl"
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
      </Field>

      <Field
        label="Hasło"
        htmlFor="password"
        error={state.fieldErrors?.password}
        hint="Minimum 8 znaków."
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
      </Field>

      <SubmitButton size="lg" className="mt-1 w-full">
        Załóż konto
      </SubmitButton>
    </form>
  )
}
