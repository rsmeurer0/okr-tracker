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
import { Loader2 } from 'lucide-react'
import { createOrg } from '@/lib/actions/orgs'

const createOrgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
})

type CreateOrgValues = z.infer<typeof createOrgSchema>

export function CreateOrgForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateOrgValues>({
    resolver: zodResolver(createOrgSchema),
  })

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    setValue('slug', slug, { shouldValidate: true })
  }

  async function onSubmit(values: CreateOrgValues) {
    setLoading(true)
    const result = await createOrg(values)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Organization created!')
    router.push(`/app/org/${result.slug}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Organization name</Label>
        <Input
          id="name"
          placeholder="Acme Corp"
          {...register('name', { onChange: handleNameChange })}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">
          URL slug
          <span className="ml-1 text-xs text-muted-foreground">(used in your org URL)</span>
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">/app/org/</span>
          <Input
            id="slug"
            placeholder="acme-corp"
            {...register('slug')}
          />
        </div>
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create organization
      </Button>
    </form>
  )
}
