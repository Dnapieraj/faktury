import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

type FieldProps = {
  label?: React.ReactNode
  htmlFor?: string
  hint?: React.ReactNode
  error?: string | string[] | null
  required?: boolean
  className?: string
  children: React.ReactNode
}

function firstError(error: FieldProps['error']) {
  if (!error) return null
  return Array.isArray(error) ? (error[0] ?? null) : error
}

function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  const message = firstError(error)
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <Label htmlFor={htmlFor}>
          {label}
          {required ? <span className="text-danger"> *</span> : null}
        </Label>
      ) : null}
      {children}
      {message ? (
        <p className="text-danger text-xs">{message}</p>
      ) : hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </div>
  )
}

export { Field }
