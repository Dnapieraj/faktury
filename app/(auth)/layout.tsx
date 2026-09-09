import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/brand/logo'

const HIGHLIGHTS = [
  'Automatyczna numeracja i PDF faktury',
  'Link do płatności Stripe w każdej fakturze',
  'Faktury cykliczne i przypomnienia w tle',
]

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            Strona główna
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          © {new Date().getFullYear()} Faktury · projekt portfolio
        </p>
      </div>

      <div className="border-border bg-surface relative hidden overflow-hidden border-l lg:block">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(60% 50% at 30% 15%, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent), radial-gradient(50% 45% at 85% 90%, color-mix(in oklab, var(--color-primary) 16%, transparent), transparent)',
          }}
        />
        <div className="relative flex h-full flex-col justify-center gap-8 px-14">
          <h2 className="max-w-md text-3xl font-semibold tracking-tight text-balance">
            Wystaw fakturę. Wyślij. Zgarnij płatność.
          </h2>
          <ul className="flex flex-col gap-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="text-muted-foreground flex items-center gap-3 text-sm">
                <CheckCircle2 className="text-primary size-4 shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
