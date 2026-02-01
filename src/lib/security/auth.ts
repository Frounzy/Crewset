import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type PlanType = 'free' | 'pro' | 'agency'

export interface UserSession {
  id: string
  email: string
  plan: PlanType
  user_metadata?: any
}

/**
 * Ensures the user is authenticated and returns the user object with their plan.
 * If not authenticated, redirects to login or throws error.
 */
export async function getAuthenticatedUser(): Promise<UserSession> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Fetch plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', user.id)
    .single()

  let plan = (subscription?.plan as PlanType) || 'free'

  // Check expiration
  if (plan !== 'free' && subscription?.current_period_end) {
    const expiryDate = new Date(subscription.current_period_end)
    if (expiryDate < new Date()) {
        plan = 'free'
    }
  }

  return {
    id: user.id,
    email: user.email!,
    plan: plan,
    user_metadata: user.user_metadata
  }
}

/**
 * Validates if the current user has the required plan.
 * Throws an error if not authorized.
 */
export async function requirePlan(requiredPlan: PlanType | PlanType[]) {
  const user = await getAuthenticatedUser()
  
  const allowedPlans = Array.isArray(requiredPlan) ? requiredPlan : [requiredPlan]
  
  // Hierarchy: agency > pro > free
  const planLevels: Record<PlanType, number> = { free: 0, pro: 1, agency: 2 }
  const currentLevel = planLevels[user.plan]
  
  const hasAccess = allowedPlans.some(p => planLevels[p] <= currentLevel)

  if (!hasAccess) {
    throw new Error(`Upgrade required: This feature requires ${allowedPlans.join(' or ')} plan.`)
  }

  return user
}

/**
 * Validates ownership of a resource explicitly.
 * Ideally RLS handles this, but this provides a double-check for business logic.
 */
export async function assertOwnership(
  table: string,
  resourceId: string,
  userId: string,
  column: string = 'user_id'
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from(table)
    .select(column)
    .eq('id', resourceId)
    .single()

  if (error || !data) {
     throw new Error('Resource not found')
  }

  if ((data as Record<string, any>)[column] !== userId) {
    throw new Error('Unauthorized access to resource')
  }
}
