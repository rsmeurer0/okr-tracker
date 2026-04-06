import { Metadata } from 'next'
import { CreateOrgForm } from '@/components/org/create-org-form'

export const metadata: Metadata = { title: 'Create organization' }

export default function NewOrgPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create your organization</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your workspace to start tracking OKRs
          </p>
        </div>
        <CreateOrgForm />
      </div>
    </div>
  )
}
