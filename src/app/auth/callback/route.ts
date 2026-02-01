import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/security/logger'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      logger.info('Auth callback success', undefined, { next })
      return NextResponse.redirect(`${origin}${next}`)
    } else {
        logger.error('Auth callback exchange error', undefined, { error: error.message })
    }
  } else {
      logger.warn('Auth callback missing code')
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
