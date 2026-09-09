'use client'

import * as React from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from './button'

type ConfirmDialogProps = {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  destructive = true,
  onConfirm,
}: ConfirmDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)

  const isOpen = open ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  async function handleConfirm() {
    try {
      setPending(true)
      await onConfirm()
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={setOpen}>
      {trigger ? <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger> : null}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="anim-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" />
        <AlertDialog.Content className="anim-dialog border-border bg-surface fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-xl border p-6 shadow-xl">
          <AlertDialog.Title className="text-base font-semibold tracking-tight">
            {title}
          </AlertDialog.Title>
          {description ? (
            <AlertDialog.Description className="text-muted-foreground text-sm">
              {description}
            </AlertDialog.Description>
          ) : null}
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel
              className={cn(buttonVariants({ variant: 'outline', size: 'md' }))}
              disabled={pending}
            >
              {cancelLabel}
            </AlertDialog.Cancel>
            <Button
              variant={destructive ? 'danger' : 'primary'}
              loading={pending}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
