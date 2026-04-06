'use client'

import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import type { OrgContext } from '@/types'

interface OrgSwitcherProps {
  currentOrg: OrgContext
  orgs: OrgContext[]
}

export function OrgSwitcher({ currentOrg, orgs }: OrgSwitcherProps) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-sm font-semibold hover:bg-accent outline-none">
        <span className="truncate">{currentOrg.name}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => router.push(`/app/org/${org.slug}`)}
            className="gap-2"
          >
            <span className="flex-1 truncate">{org.name}</span>
            {org.id === currentOrg.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/app/org/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
