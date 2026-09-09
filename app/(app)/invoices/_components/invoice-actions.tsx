'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { BellRing, Check, Pencil, Send, Trash2, Undo2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  deleteInvoiceAction,
  sendInvoiceAction,
  sendReminderAction,
  setInvoiceStatusAction,
} from '../actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import type { InvoiceStatus } from '@/lib/generated/prisma/client'

function reportEmail(res: { ok?: boolean; error?: string; emailSkipped?: boolean }, okMsg: string) {
  if (res?.error) return toast.error(res.error)
  if (res?.emailSkipped) return toast.success(`${okMsg} (e-mail wyłączony — ustaw RESEND_API_KEY)`)
  return toast.success(okMsg)
}

export function InvoiceActions({ id, status }: { id: string; status: InvoiceStatus }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const run = (fn: () => Promise<void>) => startTransition(fn)

  function send() {
    run(async () => {
      reportEmail(await sendInvoiceAction(id), 'Faktura wysłana do klienta.')
      router.refresh()
    })
  }

  function remind() {
    run(async () => {
      reportEmail(await sendReminderAction(id), 'Przypomnienie wysłane.')
      router.refresh()
    })
  }

  function changeStatus(next: InvoiceStatus, msg: string) {
    run(async () => {
      const res = await setInvoiceStatusAction(id, next)
      if (res?.error) toast.error(res.error)
      else toast.success(msg)
      router.refresh()
    })
  }

  function remove() {
    return new Promise<void>((resolve) => {
      run(async () => {
        const res = await deleteInvoiceAction(id)
        if (res?.error) toast.error(res.error)
        resolve()
      })
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === 'DRAFT' && (
        <>
          <Link
            href={`/invoices/${id}/edit`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <Pencil />
            Edytuj
          </Link>
          <Button size="sm" loading={pending} onClick={send}>
            <Send />
            Wyślij klientowi
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => changeStatus('SENT', 'Oznaczono jako wysłaną.')}
          >
            Oznacz jako wysłaną
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => setConfirmOpen(true)}
            className="text-danger hover:text-danger"
          >
            <Trash2 />
            Usuń
          </Button>
        </>
      )}

      {(status === 'SENT' || status === 'OVERDUE') && (
        <>
          <Button
            size="sm"
            loading={pending}
            onClick={() => changeStatus('PAID', 'Faktura oznaczona jako opłacona.')}
          >
            <Check />
            Oznacz jako opłaconą
          </Button>
          <Button variant="outline" size="sm" loading={pending} onClick={remind}>
            <BellRing />
            Wyślij przypomnienie
          </Button>
          <Button variant="ghost" size="sm" disabled={pending} onClick={send}>
            <Send />
            Wyślij ponownie
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => changeStatus('DRAFT', 'Faktura cofnięta do szkicu.')}
          >
            <Undo2 />
            Do szkicu
          </Button>
        </>
      )}

      {status === 'PAID' && (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => changeStatus('SENT', 'Cofnięto oznaczenie opłacenia.')}
        >
          <Undo2 />
          Cofnij opłacenie
        </Button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Usunąć szkic faktury?"
        description="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        onConfirm={remove}
      />
    </div>
  )
}
