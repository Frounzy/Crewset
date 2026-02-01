'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export async function deleteAccountAction() {
  const t = await getTranslations('Settings')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: t('unauthorized') }
  }

  const adminAuthClient = createAdminClient()
  
  // Delete user from auth.users. This should cascade to profiles, subscriptions, contracts, etc.
  // if foreign keys are set up with ON DELETE CASCADE.
  const { error } = await adminAuthClient.auth.admin.deleteUser(
    user.id
  )

  if (error) {
    console.error('Delete account error:', error)
    return { error: error.message }
  }

  return { success: true }
}
