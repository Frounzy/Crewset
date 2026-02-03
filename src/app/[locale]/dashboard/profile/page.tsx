import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Profile | Crewset',
  robots: { index: false, follow: false },
}
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/security/auth'
import { ProfileClient } from './profile-client'
import { getTranslations } from 'next-intl/server'

export default async function ProfilePage() {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()
  const t = await getTranslations('Profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const { data: portfolio } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  
  // Create a default profile object if none exists
  const safeProfile = profile || {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    username: user.email?.split('@')[0] || '',
    is_public: false
  }

  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>
      <ProfileClient 
        user={user} 
        profile={safeProfile} 
        portfolio={portfolio || []} 
      />
    </div>
  )
}
