-- ============================================================
-- OKR Tracker - Initial Schema Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (mirrors auth.users, populated by trigger)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  avatar_url  text,
  is_super_admin boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Memberships
CREATE TABLE IF NOT EXISTS public.memberships (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'org_member' CHECK (role IN ('org_admin', 'org_member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- Whitelabel configs
CREATE TABLE IF NOT EXISTS public.whitelabel_configs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           uuid UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  logo_url         text,
  primary_color    text NOT NULL DEFAULT '#6366f1',
  secondary_color  text NOT NULL DEFAULT '#8b5cf6',
  accent_color     text NOT NULL DEFAULT '#06b6d4',
  custom_domain    text UNIQUE,
  favicon_url      text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Objectives
CREATE TABLE IF NOT EXISTS public.objectives (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title       text NOT NULL,
  description text,
  period      text NOT NULL,
  status      text NOT NULL DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'behind', 'completed')),
  progress    integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Key results
CREATE TABLE IF NOT EXISTS public.key_results (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id  uuid NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  org_id        uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title         text NOT NULL,
  metric_type   text NOT NULL DEFAULT 'percentage' CHECK (metric_type IN ('percentage', 'number', 'currency', 'boolean')),
  start_value   numeric(15,4) NOT NULL DEFAULT 0,
  target_value  numeric(15,4) NOT NULL,
  current_value numeric(15,4) NOT NULL DEFAULT 0,
  progress      integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Check-ins
CREATE TABLE IF NOT EXISTS public.check_ins (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id  uuid NOT NULL REFERENCES public.key_results(id) ON DELETE CASCADE,
  org_id         uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  author_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  value          numeric(15,4) NOT NULL,
  note           text,
  confidence     text CHECK (confidence IN ('high', 'medium', 'low')),
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Activity log
CREATE TABLE IF NOT EXISTS public.activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id   uuid NOT NULL,
  action      text NOT NULL,
  metadata    jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Invitations
CREATE TABLE IF NOT EXISTS public.invitations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'org_member' CHECK (role IN ('org_admin', 'org_member')),
  invited_by  uuid NOT NULL REFERENCES public.profiles(id),
  token       text UNIQUE NOT NULL,
  accepted_at timestamptz,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS memberships_user_id_idx ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS memberships_org_id_idx ON public.memberships(org_id);
CREATE INDEX IF NOT EXISTS objectives_org_id_period_idx ON public.objectives(org_id, period);
CREATE INDEX IF NOT EXISTS key_results_objective_id_idx ON public.key_results(objective_id);
CREATE INDEX IF NOT EXISTS key_results_org_id_idx ON public.key_results(org_id);
CREATE INDEX IF NOT EXISTS check_ins_key_result_id_idx ON public.check_ins(key_result_id);
CREATE INDEX IF NOT EXISTS check_ins_org_id_idx ON public.check_ins(org_id);
CREATE INDEX IF NOT EXISTS activity_log_org_id_created_idx ON public.activity_log(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS whitelabel_configs_custom_domain_idx ON public.whitelabel_configs(custom_domain);
CREATE INDEX IF NOT EXISTS invitations_token_idx ON public.invitations(token);
CREATE INDEX IF NOT EXISTS invitations_email_org_idx ON public.invitations(email, org_id);

-- ============================================================
-- HELPER FUNCTIONS (used in RLS policies)
-- ============================================================

-- Returns all org IDs the current user is a member of
CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS SETOF uuid AS $$
  SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns the current user's role in a specific org
CREATE OR REPLACE FUNCTION public.user_org_role(p_org_id uuid)
RETURNS text AS $$
  SELECT role FROM public.memberships WHERE user_id = auth.uid() AND org_id = p_org_id
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns true if the current user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()),
    false
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- TRIGGER: Auto-create profile on new user signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelabel_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- ---- ORGANIZATIONS ----
CREATE POLICY "Members can view their orgs"
  ON public.organizations FOR SELECT
  USING (id IN (SELECT public.user_org_ids()) OR public.is_super_admin());

CREATE POLICY "Authenticated users can create orgs"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Org admins can update their org"
  ON public.organizations FOR UPDATE
  USING (public.user_org_role(id) = 'org_admin' OR public.is_super_admin());

CREATE POLICY "Super admins can delete orgs"
  ON public.organizations FOR DELETE
  USING (public.is_super_admin());

-- ---- MEMBERSHIPS ----
CREATE POLICY "Members can view memberships in their orgs"
  ON public.memberships FOR SELECT
  USING (org_id IN (SELECT public.user_org_ids()) OR public.is_super_admin());

CREATE POLICY "Org admins can create memberships"
  ON public.memberships FOR INSERT
  WITH CHECK (public.user_org_role(org_id) = 'org_admin' OR public.is_super_admin());

CREATE POLICY "Org admins can update memberships"
  ON public.memberships FOR UPDATE
  USING (public.user_org_role(org_id) = 'org_admin' OR public.is_super_admin());

CREATE POLICY "Org admins can delete memberships"
  ON public.memberships FOR DELETE
  USING (public.user_org_role(org_id) = 'org_admin' OR public.is_super_admin());

-- ---- WHITELABEL CONFIGS ----
CREATE POLICY "Members can view their org whitelabel"
  ON public.whitelabel_configs FOR SELECT
  USING (org_id IN (SELECT public.user_org_ids()) OR public.is_super_admin());

CREATE POLICY "Org admins can manage whitelabel"
  ON public.whitelabel_configs FOR ALL
  USING (public.user_org_role(org_id) = 'org_admin' OR public.is_super_admin());

-- ---- OBJECTIVES ----
CREATE POLICY "Members can view org objectives"
  ON public.objectives FOR SELECT
  USING (org_id IN (SELECT public.user_org_ids()) OR public.is_super_admin());

CREATE POLICY "Members can create objectives"
  ON public.objectives FOR INSERT
  WITH CHECK (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "Owner or org admin can update objectives"
  ON public.objectives FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR public.user_org_role(org_id) = 'org_admin'
    OR public.is_super_admin()
  );

CREATE POLICY "Owner or org admin can delete objectives"
  ON public.objectives FOR DELETE
  USING (
    owner_id = auth.uid()
    OR public.user_org_role(org_id) = 'org_admin'
    OR public.is_super_admin()
  );

-- ---- KEY RESULTS ----
CREATE POLICY "Members can view org key results"
  ON public.key_results FOR SELECT
  USING (org_id IN (SELECT public.user_org_ids()) OR public.is_super_admin());

CREATE POLICY "Members can create key results"
  ON public.key_results FOR INSERT
  WITH CHECK (org_id IN (SELECT public.user_org_ids()));

CREATE POLICY "Owner or org admin can update key results"
  ON public.key_results FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR public.user_org_role(org_id) = 'org_admin'
    OR public.is_super_admin()
  );

CREATE POLICY "Owner or org admin can delete key results"
  ON public.key_results FOR DELETE
  USING (
    owner_id = auth.uid()
    OR public.user_org_role(org_id) = 'org_admin'
    OR public.is_super_admin()
  );

-- ---- CHECK-INS ----
CREATE POLICY "Members can view org check-ins"
  ON public.check_ins FOR SELECT
  USING (org_id IN (SELECT public.user_org_ids()) OR public.is_super_admin());

CREATE POLICY "Members can create check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (org_id IN (SELECT public.user_org_ids()) AND author_id = auth.uid());

CREATE POLICY "Author or org admin can delete check-ins"
  ON public.check_ins FOR DELETE
  USING (
    author_id = auth.uid()
    OR public.user_org_role(org_id) = 'org_admin'
    OR public.is_super_admin()
  );

-- ---- ACTIVITY LOG ----
CREATE POLICY "Members can view org activity"
  ON public.activity_log FOR SELECT
  USING (org_id IN (SELECT public.user_org_ids()) OR public.is_super_admin());

-- Inserts go through service role only (via server actions)

-- ---- INVITATIONS ----
CREATE POLICY "Org admins can view invitations"
  ON public.invitations FOR SELECT
  USING (public.user_org_role(org_id) = 'org_admin' OR public.is_super_admin());

CREATE POLICY "Org admins can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (public.user_org_role(org_id) = 'org_admin' OR public.is_super_admin());

CREATE POLICY "Org admins can delete invitations"
  ON public.invitations FOR DELETE
  USING (public.user_org_role(org_id) = 'org_admin' OR public.is_super_admin());
