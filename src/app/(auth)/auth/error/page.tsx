import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Authentication error' }

export default function AuthErrorPage() {
  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <h1 className="text-2xl font-bold">Authentication failed</h1>
      <p className="text-sm text-muted-foreground">
        Something went wrong during sign in. Please try again.
      </p>
      <Button asChild>
        <Link href="/auth/login">Back to sign in</Link>
      </Button>
    </div>
  )
}
