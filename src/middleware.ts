import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { routing } from './navigation'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware to handle locale routing
  const response = await intlMiddleware(request)

  // 2. Pass the response to Supabase middleware to handle session
  return await updateSession(request, response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes) - typically not localized, but if you want localized API, remove this.
     *   However, updateSession logic assumes API routes are public or handled separately.
     *   We excluded API from auth redirect in updateSession, but we should also check if we want them localized.
     *   Usually API routes are NOT localized by next-intl.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
