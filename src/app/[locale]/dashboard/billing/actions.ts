'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getTranslations } from 'next-intl/server'

const billingSchema = z.object({
  billing_company_name: z.string().optional(),
  billing_tax_id: z.string().optional(),
  billing_tax_office: z.string().optional(),
  billing_address: z.string().optional(),
})

export async function updateBillingInfo(prevState: any, formData: FormData) {
  const t = await getTranslations('Billing')
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: t('unauthorized') }
  }

  const rawData = {
    billing_company_name: formData.get('billing_company_name') as string,
    billing_tax_id: formData.get('billing_tax_id') as string,
    billing_tax_office: formData.get('billing_tax_office') as string,
    billing_address: formData.get('billing_address') as string,
  }

  const validatedFields = billingSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: t('invalidData') }
  }

  const { error } = await supabase
    .from('profiles')
    .update(validatedFields.data)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/billing')
  return { success: t('billingInfoUpdated') }
}
