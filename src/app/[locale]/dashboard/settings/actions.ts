'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

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

const contractTemplateSchema = z.object({
  contract_template: z.string().max(20000).optional(),
})

export async function saveContractTemplate(formData: FormData) {
  const t = await getTranslations('Settings')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: t('unauthorized') }
  }

  const raw = {
    contract_template: (formData.get('contract_template') as string) || ''
  }
  const validated = contractTemplateSchema.safeParse(raw)
  if (!validated.success) {
    return { error: t('invalidData') || 'Geçersiz veri' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ contract_template: validated.data.contract_template })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: t('success') || 'Kaydedildi' }
}
