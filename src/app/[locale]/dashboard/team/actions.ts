'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAuthenticatedUser, requirePlan, assertOwnership } from '@/lib/security/auth'

const createOrgSchema = z.object({
  name: z.string().min(2).max(50),
})

const inviteMemberSchema = z.object({
  email: z.string().email(),
})

export async function createOrganization(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Centralized Auth & Plan Check
  const user = await requirePlan('agency')

  const name = formData.get('name') as string
  const result = createOrgSchema.safeParse({ name })

  if (!result.success) {
    return { error: 'Invalid organization name' }
  }

  // Use admin client to bypass RLS for creation
  const adminSupabase = createAdminClient()

  // 2. Create Organization
  const { data: org, error: orgError } = await adminSupabase
    .from('organizations')
    .insert({ name: result.data.name })
    .select()
    .single()

  if (orgError) {
    return { error: orgError.message }
  }

  // 3. Add current user as Owner
  const { error: memberError } = await adminSupabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: 'owner'
    })

  if (memberError) {
    // Rollback (delete org) if member creation fails
    await adminSupabase.from('organizations').delete().eq('id', org.id)
    return { error: 'Failed to create organization membership: ' + memberError.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function inviteMember(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  
  // 1. Centralized Auth & Plan Check
  const user = await requirePlan('agency')

  const email = formData.get('email') as string
  const result = inviteMemberSchema.safeParse({ email })

  if (!result.success) {
    return { error: 'Invalid email address' }
  }

  // 2. Check if user is an owner of an organization
  const { data: membership, error: membershipError } = await adminSupabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  if (membershipError || !membership) {
    return { error: 'You must be an organization owner to invite members.' }
  }

  const organizationId = membership.organization_id
  
  // Check member count
  const { count } = await adminSupabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    
  if (count !== null && count >= 3) {
      return { error: 'Agency plan allows up to 3 team members.' }
  }

  // 3. Find user by email (Using Auth Admin API because profiles doesn't have email column)
  let targetUserId = null

  const { data: { users }, error: listUsersError } = await adminSupabase.auth.admin.listUsers({
     perPage: 1000 
  })
  
  if (!listUsersError && users) {
     const authUser = users.find((u: any) => u.email?.toLowerCase() === result.data.email.toLowerCase())
     if (authUser) {
         targetUserId = authUser.id
         
         // Check if profile exists, if not create it
         const { data: profile } = await adminSupabase
            .from('profiles')
            .select('id')
            .eq('id', authUser.id)
            .single()

         if (!profile) {
             // Create profile
             await adminSupabase
              .from('profiles')
              .insert({
                  id: authUser.id,
                  full_name: authUser.user_metadata?.full_name || '',
                  created_at: authUser.created_at,
                  updated_at: new Date().toISOString()
              })
         }
     }
  }

  if (!targetUserId) {
    return { error: 'User not found. They must sign up for Crewset first.' }
  }

  // 4. Add user to organization
  const { error: inviteError } = await adminSupabase
    .from('organization_members')
    .insert({
      organization_id: organizationId,
      user_id: targetUserId,
      role: 'member'
    })

  if (inviteError) {
    if (inviteError.code === '23505') { // Unique violation
        return { error: 'User is already a member of this organization.' }
    }
    return { error: inviteError.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function leaveOrganization() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  const user = await getAuthenticatedUser()

  // Delete membership
  const { error } = await adminSupabase
    .from('organization_members')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function removeMember(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  const user = await getAuthenticatedUser()

  const memberId = formData.get('memberId') as string
  if (!memberId) {
    return { error: 'Member ID is required' }
  }

  // 1. Check if user is an owner of the organization
  const { data: membership, error: membershipError } = await adminSupabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  if (membershipError || !membership) {
    return { error: 'You must be an organization owner to remove members.' }
  }

  const organizationId = membership.organization_id

  // 2. Remove member
  const { error: removeError } = await adminSupabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', memberId)

  if (removeError) {
    return { error: removeError.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
