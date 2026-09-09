'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Pause, Play, Trash2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { deleteRecurringAction, runRecurringNowAction, setRecurringStatusAction } from '../actions'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { RecurringStatus } from '@/lib/generated/prisma/client'

export function RecurringActions({
  id,
  status,
  variant = 'full',
}: {
  id: string
  status: RecurringStatus
  variant?: 'full' | 'compact'
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function toggle() {
    startTransition(async () => {
      const next = status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      const res = await setRecurringStatusAction(id, next)
      if (res?.error) toast.error(res.error)
      else toast.success(next === 'ACTIVE' ? 'Szablon wznowiony.' : 'Szablon wstrzymany.')
      router.refresh()
    })
  }

  function runNow() {
    startTransition(async () => {
      const res = await runRecurringNowAction(id)
      if (res?.error) toast.error(res.error)
      else toast.success(`Wystawiono fakturę ${res.number}.`)
      router.refresh()
    })
  }

  function remove() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await deleteRecurringAction(id)
        if (res?.error) toast.error(res.error)
        resolve()
      })
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        loading={pending}
        onClick={toggle}
        aria-label={status === 'ACTIVE' ? 'Wstrzymaj' : 'Wznów'}
      >
        {status === 'ACTIVE' ? <Pause /> : <Play />}
        {variant === 'full' && (status === 'ACTIVE' ? 'Wstrzymaj' : 'Wznów')}
      </Button>

      {variant === 'full' && (
        <>
          <Button size="sm" loading={pending} onClick={runNow}>
            <Zap />
            Wystaw teraz
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Usunąć szablon?"
        description="Wystawione wcześniej faktury pozostaną. Sam szablon zniknie."
        confirmLabel="Usuń"
        onConfirm={remove}
      />
    </div>
  )
}
