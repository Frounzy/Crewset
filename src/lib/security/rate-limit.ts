import { createClient } from '@/lib/supabase/server'
import { logger } from './logger'

/**
 * A simple DB-based Rate Limiter for Serverless functions.
 * Note: For high-traffic production, use Redis (Upstash) instead.
 */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const now = Math.floor(Date.now() / 1000)
  const windowKey = `rate_limit:${key}:${Math.floor(now / windowSeconds)}`

  // Note: This is a simplified "Fixed Window" implementation using Supabase
  // We use the 'upsert' pattern or just a simple table insert if we had a dedicated rate_limit table.
  // Since we don't want to create a table dynamically, we assume 'rate_limits' table exists.
  
  try {
    // 1. Clean up old entries (optional, better done via cron)
    // await supabase.from('rate_limits').delete().lt('expires_at', now)

    // 2. Upsert/Increment
    // Since Supabase (Postgres) doesn't have atomic increment-and-return in one REST call easily without stored procedures,
    // we will read-then-write (optimistic). For strict locking, use RPC.
    
    const { data: current } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('key', windowKey)
      .single()

    const currentCount = current?.count || 0

    if (currentCount >= limit) {
      logger.warn('Rate limit exceeded', undefined, { key, limit, currentCount })
      return { success: false }
    }

    const { error } = await supabase
      .from('rate_limits')
      .upsert({ 
        key: windowKey, 
        count: currentCount + 1, 
        expires_at: now + windowSeconds 
      }, { onConflict: 'key' })

    if (error) {
        console.error('Rate limit write error', error)
        // Fail open if DB is down, or closed? Secure default is closed.
        // But for rate limiting, fail open is often better for UX unless under attack.
        return { success: true } 
    }

    return { success: true }
  } catch (error) {
    console.error('Rate limit check failed', error)
    return { success: true } // Fail open to avoid blocking users on system error
  }
}
