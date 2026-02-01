'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart,
  Settings,
  CreditCard,
  LifeBuoy,
} from 'lucide-react'

const routes = [
  {
    label: 'dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'clients',
    icon: Users,
    href: '/dashboard/clients',
    color: 'text-violet-500',
  },
  {
    label: 'contracts',
    icon: FileText,
    href: '/dashboard/contracts',
    color: 'text-pink-700',
  },
  {
    label: 'reports',
    icon: BarChart,
    href: '/dashboard/reports',
    color: 'text-orange-700',
  },
  {
    label: 'billing',
    icon: CreditCard,
    href: '/dashboard/billing',
    color: 'text-emerald-500',
  },
  {
    label: 'profile',
    icon: Users,
    href: '/dashboard/profile',
    color: 'text-pink-500',
  },
  {
    label: 'team',
    icon: Users,
    href: '/dashboard/team',
    color: 'text-indigo-500',
  },
  {
    label: 'support',
    icon: LifeBuoy,
    href: '/support',
    color: 'text-blue-500',
  },
  {
    label: 'settings',
    icon: Settings,
    href: '/dashboard/settings',
    color: null,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations('Sidebar')

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card/30 backdrop-blur-xl border-r border-border text-foreground">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">Crewset</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition',
                pathname === route.href
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {t(route.label)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
