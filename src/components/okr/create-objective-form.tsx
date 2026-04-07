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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { createObjective } from '@/lib/actions/objectives'

const CURRENT_YEAR = new Date().getFullYear()
const PERIODS = [
  `${CURRENT_YEAR}-Q1`, `${CURRENT_YEAR}-Q2`, `${CURRENT_YEAR}-Q3`, `${CURRENT_YEAR}-Q4`,
  `${CURRENT_YEAR + 1}-Q1`, `${CURRENT_YEAR + 1}-Q2`, `${CURRENT_YEAR + 1}-Q3`, `${CURRENT_YEAR + 1}-Q4`,
]

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  period: z.string().min(1, 'Period is required'),
})

type FormValues = z.infer<typeof schema>

interface CreateObjectiveFormProps {
  orgId: string
  orgSlug: string
}

export function CreateObjectiveForm({ orgId, orgSlug }: CreateObjectiveFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const currentQ = `${CURRENT_YEAR}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { period: currentQ },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const result = await createObjective({ orgId, ...values })
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success('Objective created!')
    router.push(`/app/org/${orgSlug}/objectives/${result.id}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
        <Input
          id="title"
          placeholder="Increase customer retention by 20%"
          {...register('title')}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Why is this objective important? What does success look like?"
          rows={3}
          {...register('description')}
        />
      </div>

      <div className="space-y-2">
        <Label>Period <span className="text-destructive">*</span></Label>
        <Select defaultValue={currentQ} onValueChange={(v) => { if (v) setValue('period', v) }}>
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.period && <p className="text-xs text-destructive">{errors.period.message}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create objective
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/app/org/${orgSlug}/objectives`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
