import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null } }),
        getSession: async () => ({ data: { session: null } }),
        signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: { message: 'Supabase not configured' } }),
        updateUser: async () => ({ error: { message: 'Supabase not configured' } }),
        exchangeCodeForSession: async () => ({ error: { message: 'Supabase not configured' } }),
        resetPasswordForEmail: async () => ({ error: { message: 'Supabase not configured' } }),
        signInWithOtp: async () => ({ error: { message: 'Supabase not configured' } }),
        signInWithOAuth: async () => ({ error: { message: 'Supabase not configured' } }),
      },
      from: () => ({
        select: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        insert: () => ({ error: { message: 'Supabase not configured' } }),
        update: () => ({ error: { message: 'Supabase not configured' } }),
        delete: () => ({ error: { message: 'Supabase not configured' } }),
        eq: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        in: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        order: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        range: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        upsert: () => ({ error: { message: 'Supabase not configured' } }),
      }),
      rpc: async () => ({ error: { message: 'Supabase not configured' } }),
    } as any
  }
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
