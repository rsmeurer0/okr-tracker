import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createAdminClient } from '@/lib/supabase/admin'

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/signup', '/auth/callback', '/auth/error']

export async function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    const { supabaseResponse } = await updateSession(request)
    return supabaseResponse
  }

  const { supabaseResponse, user } = await updateSession(request)

  // Redirect unauthenticated users
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Protect /admin routes — check super_admin via service role client
  if (pathname.startsWith('/admin')) {
    const adminSupabase = createAdminClient()
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_super_admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/app/org'
      return NextResponse.redirect(url)
    }
  }

  // Protect /app/org/[slug] routes — verify membership
  const orgSlugMatch = pathname.match(/^\/app\/org\/([^/]+)/)
  if (orgSlugMatch) {
    const slug = orgSlugMatch[1]
    if (slug && slug !== 'new') {
      const adminSupabase = createAdminClient()
      const { data: org } = await adminSupabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!org) {
        const url = request.nextUrl.clone()
        url.pathname = '/app/org'
        return NextResponse.redirect(url)
      }

      const { data: membership } = await adminSupabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('org_id', org.id)
        .single()

      if (!membership) {
        const url = request.nextUrl.clone()
        url.pathname = '/app/org'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
