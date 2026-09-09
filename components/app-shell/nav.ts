import {
  LayoutDashboard,
  Users,
  FileText,
  RefreshCw,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/clients', label: 'Klienci', icon: Users },
  { href: '/invoices', label: 'Faktury', icon: FileText },
  { href: '/recurring', label: 'Cykliczne', icon: RefreshCw },
  { href: '/settings', label: 'Ustawienia', icon: Settings },
]
