'use client'

import { useActionState } from 'react'
import { loginAction, type AuthFormState } from '@/app/(auth)/actions'
import { Alert } from '@/components/ui/alert'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action] = useActionState<AuthFormState, FormData>(loginAction, {})

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.error ? <Alert variant="danger">{state.error}</Alert> : null}

      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="jan@twojafirma.pl"
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
      </Field>

      <Field label="Hasło" htmlFor="password" error={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
      </Field>

      <SubmitButton size="lg" className="mt-1 w-full">
        Zaloguj się
      </SubmitButton>
    </form>
  )
}
