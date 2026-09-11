import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <Link href="/">
        <Logo />
      </Link>
      <div className="flex flex-col items-center gap-3">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Nie znaleziono strony</h1>
        <p className="max-w-sm text-sm text-muted-foreground text-pretty">
          Ten adres nie istnieje albo strona została przeniesiona.
        </p>
      </div>
      <Button asChild>
        <Link href="/">
          <ArrowLeft />
          Wróć na stronę główną
        </Link>
      </Button>
    </div>
  )
}
