'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px]">
      <SidebarTrigger className="md:hidden" />
      <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
      {title && <h1 className="font-semibold">{title}</h1>}
    </header>
  )
}
