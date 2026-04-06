import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { getOrgBySlug } from '@/lib/queries/orgs'
import { db } from '@/db/drizzle'
import { activityLog, profiles } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const metadata: Metadata = { title: 'Activity' }

interface ActivityPageProps {
  params: Promise<{ slug: string }>
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { slug } = await params
  const org = await getOrgBySlug(slug)
  if (!org) notFound()

  const activities = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      entityType: activityLog.entityType,
      metadata: activityLog.metadata,
      createdAt: activityLog.createdAt,
      userName: profiles.fullName,
      userEmail: profiles.email,
    })
    .from(activityLog)
    .leftJoin(profiles, eq(activityLog.userId, profiles.id))
    .where(eq(activityLog.orgId, org.id))
    .orderBy(desc(activityLog.createdAt))
    .limit(50)

  return (
    <>
      <Header title="Activity" />
      <div className="p-4 md:p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Activity Feed</h2>
          <p className="text-sm text-muted-foreground">Recent changes in your organization</p>
        </div>

        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <p className="text-muted-foreground">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => {
              const name = activity.userName ?? activity.userEmail ?? 'Unknown user'
              const initials = name.slice(0, 2).toUpperCase()
              return (
                <div key={activity.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{name}</span>
                      {' '}{activity.action}{' '}
                      <span className="text-muted-foreground">{activity.entityType}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
