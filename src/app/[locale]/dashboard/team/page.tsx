import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TeamClient } from './team-client'

export default async function TeamPage() {
  const t = await getTranslations('Team')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Use admin client to fetch data to ensure visibility regardless of RLS policies
  const adminSupabase = createAdminClient()

  // 1. Fetch raw membership to find organization_id
  const { data: memberships, error: membershipError } = await adminSupabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)

  if (membershipError) {
    console.error('Error fetching memberships:', JSON.stringify(membershipError, null, 2))
  }

  const currentMembership = memberships?.[0]
  
  let organization = null
  let members: any[] = []

  if (currentMembership?.organization_id) {
    // 2. Fetch Organization Details
    const { data: orgData, error: orgError } = await adminSupabase
        .from('organizations')
        .select('*')
        .eq('id', currentMembership.organization_id)
        .single()
    
    if (orgError) {
        console.error('Error fetching organization:', JSON.stringify(orgError, null, 2))
    } else {
        organization = orgData
    }

    // 3. Fetch All Members of this Organization
    const { data: orgMembers, error: membersError } = await adminSupabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', currentMembership.organization_id)

    if (membersError) {
        console.error('Error fetching org members:', JSON.stringify(membersError, null, 2))
    } else if (orgMembers) {
        // 4. Fetch Profiles for these members
        const userIds = orgMembers.map(m => m.user_id)
        const { data: profiles, error: profilesError } = await adminSupabase
            .from('profiles')
            .select('*')
            .in('id', userIds)
        
        if (profilesError) {
            console.error('Error fetching profiles:', JSON.stringify(profilesError, null, 2))
        }

        // Fetch emails from Auth (since profiles doesn't have email)
        const emailsMap = new Map<string, string>();
        for (const userId of userIds) {
             const { data: { user } } = await adminSupabase.auth.admin.getUserById(userId)
             if (user && user.email) {
                 emailsMap.set(userId, user.email)
             }
        }

        // Merge members with profiles
        members = orgMembers.map(m => {
            const profile = profiles?.find(p => p.id === m.user_id)
            return {
                ...m,
                profiles: {
                    full_name: null,
                    ...profile,
                    email: emailsMap.get(m.user_id) || ''
                }
            }
        })
    }
  }

  // Fetch subscription plan
  const { data: subscription } = await adminSupabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()
  
  const subscriptionPlan = subscription?.plan || 'free'

  const transformedOrg = organization ? {
    id: organization.id,
    name: organization.name,
    role: currentMembership?.role || 'member',
    logo_url: (organization as any)?.logo_url || null
  } : null

  const transformedMembers = members.map(member => ({
    id: member.id,
    role: member.role,
    profile: member.profiles || member.profile,
    user_id: member.user_id
  }))

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>
      
      <TeamClient 
        organization={transformedOrg}
        members={transformedMembers}
        currentUserId={user.id}
        subscriptionPlan={subscriptionPlan}
      />
    </div>
  )
}
