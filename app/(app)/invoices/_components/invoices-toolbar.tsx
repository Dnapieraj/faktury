'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const STATUS_TABS = [
  { value: '', label: 'Wszystkie' },
  { value: 'DRAFT', label: 'Szkice' },
  { value: 'SENT', label: 'Wysłane' },
  { value: 'OVERDUE', label: 'Zaległe' },
  { value: 'PAID', label: 'Opłacone' },
]

export function InvoicesToolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = React.useTransition()

  const status = params.get('status') ?? ''
  const q = params.get('q') ?? ''

  function push(next: URLSearchParams) {
    startTransition(() => {
      router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false })
    })
  }

  function setStatus(value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set('status', value)
    else next.delete('status')
    push(next)
  }

  function setSearch(value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set('q', value)
    else next.delete('q')
    push(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="no-scrollbar border-border -mb-px flex gap-1 overflow-x-auto border-b">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            aria-current={status === tab.value ? 'true' : undefined}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              status === tab.value
                ? 'border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="relative sm:max-w-xs">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="search"
          defaultValue={q}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po numerze lub kliencie…"
          className={cn('pl-9', pending && 'opacity-70')}
          aria-label="Szukaj faktur"
        />
      </div>
    </div>
  )
}
