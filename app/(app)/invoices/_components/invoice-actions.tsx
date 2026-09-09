'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Check, Pencil, Send, Trash2, Undo2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { deleteInvoiceAction, setInvoiceStatusAction } from '../actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import type { InvoiceStatus } from '@/lib/generated/prisma/client'

export function InvoiceActions({ id, status }: { id: string; status: InvoiceStatus }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function changeStatus(next: InvoiceStatus, successMsg: string) {
    startTransition(async () => {
      const res = await setInvoiceStatusAction(id, next)
      if (res?.error) toast.error(res.error)
      else toast.success(successMsg)
      router.refresh()
    })
  }

  function remove() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
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
          <Button
            size="sm"
            loading={pending}
            onClick={() => changeStatus('SENT', 'Faktura oznaczona jako wysłana.')}
          >
            <Send />
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
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => changeStatus('DRAFT', 'Faktura cofnięta do szkicu.')}
          >
            <Undo2 />
            Cofnij do szkicu
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
