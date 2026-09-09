'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function ClientsToolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = React.useTransition()

  const q = params.get('q') ?? ''
  const showArchived = params.get('archived') === '1'

  function update(next: URLSearchParams) {
    startTransition(() => {
      router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false })
    })
  }

  function onSearch(value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set('q', value)
    else next.delete('q')
    update(next)
  }

  function toggleArchived() {
    const next = new URLSearchParams(params)
    if (showArchived) next.delete('archived')
    else next.set('archived', '1')
    update(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          defaultValue={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Szukaj po nazwie, NIP, e-mailu…"
          className={cn('pl-9', pending && 'opacity-70')}
          aria-label="Szukaj klientów"
        />
      </div>
      <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm select-none">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={toggleArchived}
          className="border-input accent-primary size-4 rounded"
        />
        Pokaż zarchiwizowanych
      </label>
    </div>
  )
}
