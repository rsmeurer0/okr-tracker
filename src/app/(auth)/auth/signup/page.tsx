import { Metadata } from 'next'
import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Create account' }

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start tracking your OKRs for free</p>
      </div>

      <SignupForm />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="underline underline-offset-4 hover:text-foreground">
          Sign in
        </Link>
      </p>
    </div>
  )
}
