import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CreditCard,
  FileText,
  Mail,
  RefreshCw,
} from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: FileText,
    title: 'Faktury w 30 sekund',
    desc: 'Automatyczna numeracja, pozycje z VAT, terminy płatności i statusy. Gotowy PDF jednym kliknięciem.',
  },
  {
    icon: CreditCard,
    title: 'Płatność online',
    desc: 'Do każdej faktury dołączamy link Stripe. Klient płaci kartą lub BLIK-iem, Ty widzisz to od razu.',
  },
  {
    icon: Mail,
    title: 'Wysyłka mailem',
    desc: 'Faktura trafia do klienta razem z linkiem do płatności. Potwierdzenie wpłaty dostajesz automatycznie.',
  },
  {
    icon: RefreshCw,
    title: 'Faktury cykliczne',
    desc: 'Ustaw abonament raz — co miesiąc wystawi się i wyśle sam, bez Twojego udziału.',
  },
  {
    icon: BellRing,
    title: 'Przypomnienia',
    desc: 'Po terminie faktura zmienia status na „zaległa”, a klient dostaje uprzejme przypomnienie.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard przychodów',
    desc: 'Przychód w czasie, kwoty do zapłaty i zaległości — wszystko na jednym ekranie.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Dodaj klienta',
    desc: 'Nazwa, NIP, adres i e-mail. Raz wpisane, zawsze pod ręką.',
  },
  {
    n: '02',
    title: 'Wystaw fakturę',
    desc: 'Wybierz klienta, dodaj pozycje. Numer i PDF generują się same.',
  },
  {
    n: '03',
    title: 'Odbierz płatność',
    desc: 'Klient płaci przez link Stripe, status zmienia się na „opłacona”.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-border/70 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden sm:inline-flex" />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Zaloguj się</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">
                Załóż konto
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-105 opacity-70 blur-3xl"
            style={{
              background:
                'radial-gradient(45% 60% at 50% 0%, color-mix(in oklab, var(--color-primary) 28%, transparent), transparent)',
            }}
          />
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
            <div className="flex flex-col items-start gap-6">
              <Badge variant="primary">Dla freelancerów i małych firm</Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Fakturowanie, które kończy się na „opłacona”.
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg text-pretty">
                Wystaw fakturę, wyślij ją klientowi z linkiem do płatności i śledź przychód w czasie
                rzeczywistym. Faktury cykliczne i przypomnienia działają w tle.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button asChild size="lg">
                  <Link href="/register">
                    Zacznij za darmo
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Mam już konto</Link>
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Bez karty. PLN, VAT, polski wzór faktury.
              </p>
            </div>

            <InvoicePreview />
          </div>
        </section>

        {/* Features */}
        <section className="border-border bg-surface/40 border-t">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Wszystko, czego potrzebujesz do rozliczeń
              </h2>
              <p className="text-muted-foreground mt-3">
                Jeden przepływ: od wystawienia faktury po zaksięgowaną wpłatę.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="border-border bg-surface hover:border-primary/30 rounded-xl border p-5 shadow-xs transition-colors"
                >
                  <span className="bg-primary/10 text-primary grid size-10 place-items-center rounded-lg">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-border border-t">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Jak to działa</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="border-primary/30 border-t-2 pt-4">
                  <span className="text-primary font-mono text-sm">{s.n}</span>
                  <h3 className="mt-2 text-base font-semibold">{s.title}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-border bg-surface/40 border-t">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Wystaw pierwszą fakturę jeszcze dziś
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-md">
              Załóż konto e-mailem lub przez Google. Dane Twojej firmy uzupełnisz w minutę.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/register">
                Załóż konto
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-border border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo />
          <p className="text-muted-foreground text-xs">
            Projekt portfolio · Next.js 16 · Prisma · Stripe · zbudowany przez dnapieraj
          </p>
        </div>
      </footer>
    </div>
  )
}

function InvoicePreview() {
  const rows = [
    { name: 'Projekt strony — etap 1', qty: '1', net: '4 800,00' },
    { name: 'Warsztat UX (8 h)', qty: '8', net: '2 400,00' },
    { name: 'Opieka powdrożeniowa', qty: '1', net: '600,00' },
  ]
  return (
    <div className="relative lg:pl-6">
      <div className="from-primary/10 absolute -inset-4 -z-10 rounded-3xl bg-linear-to-tr to-transparent" />
      <div className="border-border bg-surface rounded-2xl border p-6 shadow-lg shadow-black/5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-xs">Faktura</p>
            <p className="text-lg font-semibold tracking-tight">FV/2026/0042</p>
          </div>
          <Badge variant="success">Opłacona</Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-muted-foreground">Sprzedawca</p>
            <p className="mt-1 font-medium">Twoja Firma sp. z o.o.</p>
            <p className="text-muted-foreground">NIP 000-000-00-00</p>
          </div>
          <div>
            <p className="text-muted-foreground">Nabywca</p>
            <p className="mt-1 font-medium">Kontrahent S.A.</p>
            <p className="text-muted-foreground">NIP 111-111-11-11</p>
          </div>
        </div>

        <div className="border-border mt-5 overflow-hidden rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-surface-muted text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Pozycja</th>
                <th className="px-3 py-2 text-right font-medium">Ilość</th>
                <th className="px-3 py-2 text-right font-medium">Netto</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {rows.map((r) => (
                <tr key={r.name}>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.qty}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-muted-foreground text-xs">Do zapłaty (brutto)</span>
          <span className="text-lg font-semibold tabular-nums">9 594,00 zł</span>
        </div>
      </div>
    </div>
  )
}
