'use client'

import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMounted } from '@/lib/use-mounted'

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Jasny' },
  { value: 'system', icon: Monitor, label: 'Systemowy' },
  { value: 'dark', icon: Moon, label: 'Ciemny' },
] as const

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <div
      className={cn(
        'border-border bg-surface inline-flex items-center gap-0.5 rounded-full border p-0.5',
        className,
      )}
      role="radiogroup"
      aria-label="Motyw"
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = mounted && theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn(
              'text-muted-foreground grid size-7 place-items-center rounded-full transition-colors',
              'hover:text-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              active && 'bg-surface-muted text-foreground shadow-xs',
            )}
          >
            <Icon className="size-3.5" />
          </button>
        )
      })}
    </div>
  )
}
