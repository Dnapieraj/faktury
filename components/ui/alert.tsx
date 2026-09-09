import * as React from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        info: 'border-border bg-surface-muted text-foreground',
        success: 'border-success/25 bg-success/10 text-foreground',
        danger: 'border-danger/25 bg-danger/10 text-foreground',
      },
    },
    defaultVariants: { variant: 'info' },
  },
)

const ICONS = { info: Info, success: CheckCircle2, danger: AlertCircle }

function Alert({
  className,
  variant = 'info',
  children,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  const Icon = ICONS[variant ?? 'info']
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon
        className={cn(
          variant === 'danger' && 'text-danger',
          variant === 'success' && 'text-success',
          variant === 'info' && 'text-muted-foreground',
        )}
      />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export { Alert }
