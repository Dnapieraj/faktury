import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border bg-surface/40 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="bg-surface-muted text-muted-foreground grid size-11 place-items-center rounded-full">
          <Icon className="size-5" />
        </span>
      ) : null}
      <div className="max-w-sm">
        <p className="font-medium">{title}</p>
        {description ? (
          <p className="text-muted-foreground mt-1 text-sm text-pretty">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}

export { EmptyState }
