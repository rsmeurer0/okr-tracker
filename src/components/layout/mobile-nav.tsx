'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, Activity, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  orgSlug: string
}

export function MobileNav({ orgSlug }: MobileNavProps) {
  const pathname = usePathname()
  const base = `/app/org/${orgSlug}`

  const items = [
    { href: base, label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: `${base}/objectives`, label: 'Objectives', icon: Target },
    { href: `${base}/activity`, label: 'Activity', icon: Activity },
    { href: `${base}/settings`, label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16">
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive
                  ? 'text-[var(--brand-primary)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
