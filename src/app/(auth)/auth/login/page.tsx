import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="underline underline-offset-4 hover:text-foreground">
          Sign up
        </Link>
      </p>
    </div>
  )
}
