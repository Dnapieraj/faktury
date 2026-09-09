import { Hammer } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={Hammer}
        title="Ta sekcja jest w budowie"
        description="Wróć tu wkrótce — pracujemy nad nią."
      />
    </div>
  )
}
