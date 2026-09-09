import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

export default function AppNotFound() {
  return (
    <div className="py-10">
      <EmptyState
        icon={FileQuestion}
        title="Nie znaleziono strony"
        description="Ten zasób nie istnieje albo nie masz do niego dostępu."
        action={
          <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline' }))}>
            Wróć do panelu
          </Link>
        }
      />
    </div>
  )
}
