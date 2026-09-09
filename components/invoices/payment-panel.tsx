'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Check, Copy, CreditCard, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { createPaymentLinkAction } from '@/app/(app)/invoices/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InvoiceStatus } from '@/lib/generated/prisma/client'

export function PaymentPanel({
  invoiceId,
  status,
  paymentUrl,
  stripeEnabled,
}: {
  invoiceId: string
  status: InvoiceStatus
  paymentUrl: string | null
  stripeEnabled: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState(paymentUrl)

  function generate() {
    startTransition(async () => {
      const res = await createPaymentLinkAction(invoiceId)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      if (res?.url) setUrl(res.url)
      toast.success('Link do płatności gotowy.')
      router.refresh()
    })
  }

  async function copy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Płatność online</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {status === 'PAID' ? (
          <p className="text-muted-foreground">Faktura została opłacona.</p>
        ) : !stripeEnabled ? (
          <p className="text-muted-foreground">
            Płatności online są wyłączone. Ustaw <code className="text-xs">STRIPE_SECRET_KEY</code>.
          </p>
        ) : url ? (
          <>
            <p className="text-muted-foreground">Wyślij ten link klientowi:</p>
            <div className="flex items-center gap-2">
              <code className="bg-surface-muted min-w-0 flex-1 truncate rounded-md px-2.5 py-2 text-xs">
                {url}
              </code>
              <Button variant="outline" size="icon" onClick={copy} aria-label="Kopiuj link">
                {copied ? <Check className="text-success" /> : <Copy />}
              </Button>
              <Button variant="outline" size="icon" asChild aria-label="Otwórz">
                <a href={url} target="_blank" rel="noopener">
                  <ExternalLink />
                </a>
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">
              Utwórz link do płatności Stripe. Wystawi to fakturę (status: wysłana).
            </p>
            <Button onClick={generate} loading={pending} className="self-start">
              <CreditCard />
              Utwórz link do płatności
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
