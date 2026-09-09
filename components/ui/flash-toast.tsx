'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const MESSAGES: Record<string, { type: 'success' | 'error'; text: string }> = {
  'client-created': { type: 'success', text: 'Klient dodany.' },
  'client-updated': { type: 'success', text: 'Zmiany zapisane.' },
  'client-deleted': { type: 'success', text: 'Klient usunięty.' },
  'client-archived': { type: 'success', text: 'Klient zarchiwizowany.' },
  'client-restored': { type: 'success', text: 'Klient przywrócony.' },
  'settings-saved': { type: 'success', text: 'Ustawienia zapisane.' },
  'invoice-created': { type: 'success', text: 'Szkic faktury zapisany.' },
  'invoice-updated': { type: 'success', text: 'Zmiany zapisane.' },
  'invoice-deleted': { type: 'success', text: 'Faktura usunięta.' },
}

/** Reads `?toast=<key>`, shows it once, then strips it from the URL. */
export function FlashToast() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const key = params.get('toast')

  React.useEffect(() => {
    if (!key) return
    const msg = MESSAGES[key]
    if (msg) toast[msg.type](msg.text)

    const next = new URLSearchParams(params)
    next.delete('toast')
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return null
}
