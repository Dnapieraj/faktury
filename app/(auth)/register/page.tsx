import type { Metadata } from 'next'
import Link from 'next/link'
import { redirectIfAuthenticated } from '@/lib/auth'
import { isGoogleEnabled } from '@/lib/env'
import { GoogleButton } from '@/components/auth/google-button'
import { RegisterForm } from './register-form'

export const metadata: Metadata = { title: 'Rejestracja' }

export default async function RegisterPage() {
  await redirectIfAuthenticated()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Załóż konto</h1>
        <p className="text-muted-foreground text-sm">
          Masz już konto?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>

      {isGoogleEnabled() ? (
        <>
          <GoogleButton />
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="bg-border h-px flex-1" />
            lub e-mailem
            <span className="bg-border h-px flex-1" />
          </div>
        </>
      ) : null}

      <RegisterForm />

      <p className="text-muted-foreground text-center text-xs">
        Zakładając konto akceptujesz regulamin i politykę prywatności.
      </p>
    </div>
  )
}
