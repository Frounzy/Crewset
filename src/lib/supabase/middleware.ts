import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response: NextResponse) {
  let supabaseResponse = response

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          
          supabaseResponse = response
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get pathname without locale
  const pathname = request.nextUrl.pathname
  const localePattern = /^\/(?:en|tr)/
  const pathWithoutLocale = pathname.replace(localePattern, '') || '/'
  const localeMatch = pathname.match(localePattern)
  const locale = localeMatch ? localeMatch[0] : '/en'

  // Protected routes logic
  // Public profile: /{username} should be publicly accessible
  const isPublicProfile = /^\/[a-zA-Z0-9_-]+$/.test(pathWithoutLocale)
  if (
    !user &&
    !pathWithoutLocale.startsWith('/login') &&
    !pathWithoutLocale.startsWith('/auth') &&
    !pathWithoutLocale.startsWith('/register') &&
    !pathWithoutLocale.startsWith('/forgot-password') &&
    !pathWithoutLocale.startsWith('/update-password') &&
    !pathWithoutLocale.startsWith('/sign') &&
    !pathWithoutLocale.startsWith('/feedback') &&
    !pathWithoutLocale.startsWith('/api') && // Exclude API routes from auth redirect if they are public (some might be)
    pathWithoutLocale !== '/' &&
    !isPublicProfile
  ) {
    const url = request.nextUrl.clone()
    url.pathname = `${locale}/404`
    return NextResponse.redirect(url)
  }

  // If user is logged in, and tries to access auth pages, redirect to dashboard
  if (
    user && 
    (pathWithoutLocale.startsWith('/login') || 
     pathWithoutLocale.startsWith('/register') ||
     pathWithoutLocale.startsWith('/forgot-password'))
  ) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard' // or locale prefixed dashboard
      url.pathname = `${locale}/dashboard`
      return NextResponse.redirect(url)
  }

  // Admin/Debug/Test hardening in production
  if (['/admin', '/debug', '/test'].some((p) => pathWithoutLocale.startsWith(p))) {
    if (process.env.NODE_ENV === 'production') {
      const ipHeader = request.headers.get('x-forwarded-for') || ''
      const ip = (request.ip || ipHeader.split(',')[0] || '').trim()
      const whitelist = (process.env.ADMIN_IP_WHITELIST || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (!ip || !whitelist.includes(ip)) {
        const url = request.nextUrl.clone()
        url.pathname = `${locale}/`
        return NextResponse.redirect(url)
      }
    }
  }

  // CSRF token (double-submit cookie) setup for non-GET requests
  const method = request.method || 'GET'
  const hasCsrf = request.cookies.get('csrf_token')
  if (!hasCsrf) {
    const token = (globalThis.crypto && 'randomUUID' in globalThis.crypto) 
      ? globalThis.crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    supabaseResponse.cookies.set('csrf_token', token, {
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: 2 * 60 * 60,
    })
  }

  return supabaseResponse
}
