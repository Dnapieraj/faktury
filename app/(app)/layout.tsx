import { Suspense } from 'react'
import Link from 'next/link'
import { Toaster } from 'sonner'
import { requireUser } from '@/lib/auth'
import { Logo } from '@/components/brand/logo'
import { SidebarNav } from '@/components/app-shell/sidebar-nav'
import { MobileNav } from '@/components/app-shell/mobile-nav'
import { UserCard } from '@/components/app-shell/user-card'
import { FlashToast } from '@/components/ui/flash-toast'

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const user = await requireUser()
  const userCard = <UserCard email={user.email} name={user.name} />

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="border-border bg-surface/50 sticky top-0 hidden h-dvh flex-col gap-6 border-r p-4 lg:flex">
        <Link href="/dashboard" className="px-2 pt-1">
          <Logo />
        </Link>
        <SidebarNav />
        <div className="mt-auto">{userCard}</div>
      </aside>

      {/* Mobile top bar */}
      <header className="border-border bg-background/85 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur lg:hidden">
        <MobileNav footer={userCard} />
        <Link href="/dashboard">
          <Logo />
        </Link>
      </header>

      <div className="flex min-w-0 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>

      <Suspense>
        <FlashToast />
      </Suspense>

      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: 'bg-surface! border-border! text-foreground! rounded-md! shadow-lg!',
            description: 'text-muted-foreground!',
          },
        }}
      />
    </div>
  )
}
