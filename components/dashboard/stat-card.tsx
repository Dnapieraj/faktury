import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: 'default' | 'primary' | 'danger'
}) {
  return (
    <div className="border-border bg-surface flex flex-col gap-2 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span
          className={cn(
            'grid size-8 place-items-center rounded-lg',
            tone === 'primary' && 'bg-primary/10 text-primary',
            tone === 'danger' && 'bg-danger/10 text-danger',
            tone === 'default' && 'bg-surface-muted text-muted-foreground',
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  )
}
