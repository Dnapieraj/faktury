import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'border-input bg-surface flex min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-colors',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-ring focus-visible:ring-ring/25 focus-visible:ring-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/25',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
