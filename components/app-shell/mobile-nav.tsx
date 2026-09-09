'use client'

import * as React from 'react'
import { Menu } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SidebarNav } from './sidebar-nav'

export function MobileNav({ footer }: { footer?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:ring-ring grid size-9 place-items-center rounded-md focus-visible:ring-2 focus-visible:outline-none lg:hidden"
        aria-label="Menu"
      >
        <Menu className="size-5" />
      </DialogTrigger>
      <DialogContent side="left" showClose={false} className="gap-6">
        <DialogTitle className="sr-only">Menu nawigacji</DialogTitle>
        <Logo />
        <SidebarNav onNavigate={() => setOpen(false)} />
        {footer ? <div className="mt-auto">{footer}</div> : null}
      </DialogContent>
    </Dialog>
  )
}
