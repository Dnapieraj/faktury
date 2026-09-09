import { SignOutButton } from '@/components/auth/sign-out-button'
import { ThemeToggle } from '@/components/theme-toggle'

export function UserCard({ email, name }: { email?: string | null; name?: string | null }) {
  return (
    <div className="border-border bg-surface-muted/60 flex flex-col gap-3 rounded-lg border p-3">
      <div className="min-w-0">
        {name ? <p className="truncate text-sm font-medium">{name}</p> : null}
        <p className="text-muted-foreground truncate text-xs">{email}</p>
      </div>
      <div className="flex items-center justify-between">
        <ThemeToggle />
        <SignOutButton />
      </div>
    </div>
  )
}
