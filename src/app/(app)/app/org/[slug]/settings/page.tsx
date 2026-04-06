import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Settings' }

interface SettingsPageProps {
  params: Promise<{ slug: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params

  return (
    <>
      <Header title="Settings" />
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Organization Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your organization preferences</p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>Manage who has access to this organization</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href={`/app/org/${slug}/settings/members`}>Manage members</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize your organization&apos;s colors and logo</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href={`/app/org/${slug}/settings/branding`}>Customize branding</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
