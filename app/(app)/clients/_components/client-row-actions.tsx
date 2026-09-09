'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Archive, ArchiveRestore, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { toast } from 'sonner'
import { deleteClientAction, setClientArchivedAction } from '../actions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'

const itemCls =
  'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-surface-muted'

export function ClientRowActions({
  id,
  archived,
  canDelete,
}: {
  id: string
  archived: boolean
  canDelete: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function toggleArchived() {
    startTransition(async () => {
      const res = await setClientArchivedAction(id, !archived)
      if (res?.error) toast.error(res.error)
      else toast.success(archived ? 'Klient przywrócony.' : 'Klient zarchiwizowany.')
      router.refresh()
    })
  }

  function remove() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await deleteClientAction(id)
        if (res?.error) toast.error(res.error)
        resolve()
      })
    })
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          className="text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:ring-ring grid size-8 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
          aria-label="Akcje"
          disabled={pending}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            className="border-border bg-surface z-50 min-w-40 rounded-md border p-1 shadow-lg"
          >
            <DropdownMenu.Item
              className={itemCls}
              onSelect={() => router.push(`/clients/${id}/edit`)}
            >
              <Pencil className="size-4" />
              Edytuj
            </DropdownMenu.Item>
            <DropdownMenu.Item className={itemCls} onSelect={toggleArchived}>
              {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
              {archived ? 'Przywróć' : 'Archiwizuj'}
            </DropdownMenu.Item>
            {canDelete ? (
              <>
                <DropdownMenu.Separator className="bg-border my-1 h-px" />
                <DropdownMenu.Item
                  className={cn(itemCls, 'text-danger')}
                  onSelect={() => setConfirmOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Usuń
                </DropdownMenu.Item>
              </>
            ) : null}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Usunąć klienta?"
        description="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        onConfirm={remove}
      />
    </>
  )
}
