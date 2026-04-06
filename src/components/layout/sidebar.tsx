'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Target,
  Users,
  Settings,
  ChevronDown,
  Shield,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { OrgSwitcher } from '@/components/org/org-switcher'
import { UserNav } from '@/components/layout/user-nav'
import type { OrgContext } from '@/types'
import type { Profile } from '@/types'

interface AppSidebarProps {
  currentOrg: OrgContext
  orgs: OrgContext[]
  user: Profile
}

export function AppSidebar({ currentOrg, orgs, user }: AppSidebarProps) {
  const pathname = usePathname()
  const base = `/app/org/${currentOrg.slug}`

  const navItems = [
    { href: base, label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: `${base}/objectives`, label: 'Objectives', icon: Target },
    { href: `${base}/activity`, label: 'Activity', icon: Users },
    { href: `${base}/settings`, label: 'Settings', icon: Settings },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <OrgSwitcher currentOrg={currentOrg} orgs={orgs} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={isActive}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {user.isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/admin" />} isActive={pathname.startsWith('/admin')}>
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <UserNav user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
