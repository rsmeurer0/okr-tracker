'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { updateBranding } from '@/lib/actions/branding'
import type { WhitelabelConfig } from '@/types'

const brandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  logoUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
})

type BrandingValues = z.infer<typeof brandingSchema>

interface BrandingFormProps {
  orgSlug: string
  config: WhitelabelConfig | undefined
}

export function BrandingForm({ orgSlug, config }: BrandingFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BrandingValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      primaryColor: config?.primaryColor ?? '#6366f1',
      secondaryColor: config?.secondaryColor ?? '#8b5cf6',
      accentColor: config?.accentColor ?? '#06b6d4',
      logoUrl: config?.logoUrl ?? '',
    },
  })

  const primaryColor = watch('primaryColor')

  async function onSubmit(values: BrandingValues) {
    setLoading(true)
    const result = await updateBranding({ orgSlug, ...values })
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Branding updated!')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'primaryColor', label: 'Primary color' },
            { key: 'secondaryColor', label: 'Secondary color' },
            { key: 'accentColor', label: 'Accent color' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    id={key}
                    {...register(key as keyof BrandingValues)}
                    placeholder="#6366f1"
                    className="font-mono"
                  />
                  <input
                    type="color"
                    className="h-10 w-10 cursor-pointer rounded border"
                    {...register(key as keyof BrandingValues)}
                  />
                </div>
                {errors[key as keyof BrandingValues] && (
                  <p className="text-xs text-destructive">
                    {errors[key as keyof BrandingValues]?.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            placeholder="https://example.com/logo.svg"
            {...register('logoUrl')}
          />
          <p className="text-xs text-muted-foreground">
            Paste a publicly accessible image URL for your logo
          </p>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save branding
      </Button>
    </form>
  )
}
