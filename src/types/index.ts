export type { Profile, NewProfile } from '@/db/schema/profiles'
export type { Organization, NewOrganization } from '@/db/schema/organizations'
export type { Membership, NewMembership, MembershipRole } from '@/db/schema/memberships'
export type { WhitelabelConfig, NewWhitelabelConfig } from '@/db/schema/whitelabel'
export type { Objective, NewObjective, ObjectiveStatus } from '@/db/schema/objectives'
export type { KeyResult, NewKeyResult, MetricType } from '@/db/schema/key-results'
export type { CheckIn, NewCheckIn, ConfidenceLevel } from '@/db/schema/check-ins'
export type { ActivityLog, NewActivityLog } from '@/db/schema/activity-log'
export type { Invitation, NewInvitation } from '@/db/schema/invitations'

export interface OrgContext {
  id: string
  name: string
  slug: string
  role: MembershipRole
  whitelabel?: WhitelabelConfig | null
}

import type { MembershipRole } from '@/db/schema/memberships'
import type { WhitelabelConfig } from '@/db/schema/whitelabel'
