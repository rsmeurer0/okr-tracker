# OKR Tracker

A multi-tenant SaaS application for managing Objectives and Key Results. Built for teams of any size — from startups to enterprises.

## Features

- **Multi-org** — users can belong to multiple organizations, switch between them seamlessly
- **Whitelabel** — per-org custom colors and logo via CSS variables
- **Auth** — email/password, Google OAuth, GitHub OAuth (via Supabase)
- **OKR tracking** — Objectives → Key Results → Check-ins, with auto-calculated progress
- **Role-based access** — `super_admin` (platform), `org_admin`, `org_member`
- **Admin panel** — platform-wide stats and user/org management at `/admin`
- **Mobile-first** — responsive UI with bottom tab nav on mobile, Capacitor-ready for native apps
- **PWA** — installable via browser manifest
- **Activity feed** — per-org audit trail of all changes

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + shadcn/ui + Tailwind CSS v4 |
| Database + Auth | Supabase (Postgres, RLS, OAuth) |
| ORM | Drizzle ORM |
| Email | Resend + React Email |
| Forms | React Hook Form + Zod |
| Server state | TanStack Query v5 |
| Charts | Recharts |
| Hosting | Vercel |
| Package manager | pnpm |

## Project Structure

```
src/
├── app/
│   ├── (marketing)/          # Landing page
│   ├── (auth)/auth/          # Login, signup, OAuth callback
│   ├── (app)/app/
│   │   ├── org/[slug]/       # Org-scoped pages (dashboard, objectives, settings)
│   │   └── settings/         # User profile
│   └── admin/                # Super admin panel
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── auth/                 # Login/signup forms
│   ├── okr/                  # Objective/KR/check-in components
│   ├── org/                  # Org switcher, member list, branding
│   └── layout/               # Sidebar, mobile nav, header
├── db/
│   ├── schema/               # Drizzle table definitions (9 tables)
│   └── drizzle.ts            # DB client
├── lib/
│   ├── supabase/             # Client, server, proxy, admin clients
│   ├── actions/              # Server Actions (mutations)
│   └── queries/              # Data fetching for Server Components
├── proxy.ts                  # Auth session + org verification + admin guard
└── types/
supabase/
└── migrations/001_initial.sql  # Full schema + RLS policies + trigger
```

## Database Schema

9 tables, all with Row-Level Security enabled:

| Table | Purpose |
|---|---|
| `profiles` | Mirrors `auth.users`, auto-created on signup via trigger |
| `organizations` | Tenants, identified by unique slug |
| `memberships` | Users ↔ orgs with role (`org_admin` / `org_member`) |
| `whitelabel_configs` | Per-org colors and logo |
| `objectives` | OKRs with period, status, and progress |
| `key_results` | Nested under objectives, tracks metric values |
| `check_ins` | Progress updates on key results |
| `activity_log` | Append-only audit trail per org |
| `invitations` | Pending email invitations with expiry tokens |

## Development Workflow

This project uses a **Vercel environments** workflow — no local database needed:

| Git branch | Vercel environment | Supabase project |
|---|---|---|
| `main` | Production | `okr-tracker-prod` |
| `develop` | Development | `okr-tracker-dev` |
| PR branches | Preview (auto) | `okr-tracker-dev` |

**Branch flow:**
1. Create a feature branch from `develop`: `feat/123-my-feature`
2. Push → Vercel auto-deploys a preview URL
3. Test on the preview URL, open a PR referencing the GitHub issue
4. Merge to `develop` → deploys to Development environment
5. When ready: PR from `develop` → `main` → deploys to Production

All PRs run CI (typecheck + lint + build) via GitHub Actions.

## Setup

See the GitHub issues for step-by-step setup instructions:

1. [#14 — Create Supabase project & apply schema](https://github.com/rsmeurer0/okr-tracker/issues/14)
2. [#15 — Enable Google & GitHub OAuth](https://github.com/rsmeurer0/okr-tracker/issues/15)
3. [#16 — Create Vercel project & configure environments](https://github.com/rsmeurer0/okr-tracker/issues/16)
4. [#17 — Configure Resend for email](https://github.com/rsmeurer0/okr-tracker/issues/17)
5. [#18 — First login & grant super_admin](https://github.com/rsmeurer0/okr-tracker/issues/18)

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=      # Supabase service role key (server-only)
DATABASE_URL=                   # Postgres connection string (for Drizzle)
NEXT_PUBLIC_APP_URL=            # Your deployed URL
RESEND_API_KEY=                 # Resend API key
RESEND_FROM_EMAIL=              # Sender email address
```

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm typecheck    # TypeScript check
pnpm lint         # ESLint
pnpm db:generate  # Generate Drizzle migrations
pnpm db:push      # Push schema to DB (dev only)
pnpm db:studio    # Open Drizzle Studio
```

## Roles

| Role | Scope | Capabilities |
|---|---|---|
| `super_admin` | Platform-wide | Admin panel, manage all orgs and users |
| `org_admin` | Per org | Manage members, settings, branding, all OKRs |
| `org_member` | Per org | Create/edit OKRs, submit check-ins |

To grant super_admin after first signup:
```sql
UPDATE public.profiles SET is_super_admin = true WHERE email = 'your@email.com';
```

