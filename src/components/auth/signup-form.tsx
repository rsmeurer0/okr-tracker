'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignupValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(values: SignupValues) {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setEmailSent(true)
  }

  async function signInWithOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
      setOauthLoading(null)
    }
  }

  if (emailSent) {
    return (
      <div className="rounded-lg border bg-muted/50 p-6 text-center space-y-2">
        <h2 className="font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent you a confirmation link. Click it to activate your account.
        </p>
        <Button variant="link" onClick={() => router.push('/auth/login')}>
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Social login */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signInWithOAuth('google')}
          disabled={!!oauthLoading}
        >
          {oauthLoading === 'google' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Google
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signInWithOAuth('github')}
          disabled={!!oauthLoading}
        >
          {oauthLoading === 'github' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          GitHub
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or continue with email</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            placeholder="Jane Doe"
            autoComplete="name"
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>
    </div>
  )
}
