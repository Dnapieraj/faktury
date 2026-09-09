import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-lg',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-4.5" fill="none">
        <path
          d="M7 4h7.5L18 7.5V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9 9.5h5M9 13h5M9 16.5h3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="text-foreground text-[0.95rem] font-semibold tracking-tight">Faktury</span>
    </span>
  )
}
