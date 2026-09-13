import type { Metadata } from 'next'
import Link from 'next/link'
import { redirectIfAuthenticated } from '@/lib/auth'
import { isGoogleEnabled } from '@/lib/env'
import { DemoLoginButton } from '@/components/auth/demo-login-button'
import { GoogleButton } from '@/components/auth/google-button'
import { Alert } from '@/components/ui/alert'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Logowanie' }

const OAUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked:
    'Ten adres e-mail jest już przypisany do konta z hasłem. Zaloguj się hasłem.',
  AccessDenied: 'Logowanie zostało przerwane.',
  CredentialsSignin: 'Nieprawidłowy e-mail lub hasło.',
}

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  await redirectIfAuthenticated()
  const params = await searchParams
  const callbackUrl = typeof params.callbackUrl === 'string' ? params.callbackUrl : '/dashboard'
  const oauthError = typeof params.error === 'string' ? params.error : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Zaloguj się</h1>
        <p className="text-muted-foreground text-sm">
          Nie masz konta?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Załóż je za darmo
          </Link>
        </p>
      </div>

      {oauthError ? (
        <Alert variant="danger">{OAUTH_ERRORS[oauthError] ?? 'Nie udało się zalogować.'}</Alert>
      ) : null}

      <DemoLoginButton callbackUrl={callbackUrl} />
      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        lub
        <span className="bg-border h-px flex-1" />
      </div>

      {isGoogleEnabled() ? (
        <>
          <GoogleButton callbackUrl={callbackUrl} />
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="bg-border h-px flex-1" />
            lub e-mailem
            <span className="bg-border h-px flex-1" />
          </div>
        </>
      ) : null}

      <LoginForm callbackUrl={callbackUrl} />
    </div>
  )
}
