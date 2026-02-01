import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response: NextResponse) {
  let supabaseResponse = response

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

  // Protected routes logic
  if (
    !user &&
    !pathWithoutLocale.startsWith('/login') &&
    !pathWithoutLocale.startsWith('/auth') &&
    !pathWithoutLocale.startsWith('/register') &&
    !pathWithoutLocale.startsWith('/forgot-password') &&
    !pathWithoutLocale.startsWith('/update-password') &&
    !pathWithoutLocale.startsWith('/api') && // Exclude API routes from auth redirect if they are public (some might be)
    pathWithoutLocale !== '/'
  ) {
    // Determine locale to redirect to
    const localeMatch = pathname.match(localePattern)
    const locale = localeMatch ? localeMatch[0] : '/en'
    
    const url = request.nextUrl.clone()
    url.pathname = `${locale}/login`
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
      // We should probably keep locale
      const localeMatch = pathname.match(localePattern)
      const locale = localeMatch ? localeMatch[0] : '/en'
      url.pathname = `${locale}/dashboard`
      return NextResponse.redirect(url)
  }

  return supabaseResponse
}
