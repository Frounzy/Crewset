'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAuthenticatedUser, requirePlan, assertOwnership } from '@/lib/security/auth'

const contractSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  client_id: z.string().uuid('Client is required'),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
  renewal_type: z.enum(['auto-renew', 'manual']),
  value_amount: z.coerce.number().min(0, 'Value must be positive'),
  value_period: z.enum(['monthly', 'yearly']),
  renewal_probability: z.enum(['low', 'medium', 'high']),
  status: z.enum(['active', 'expired', 'renewed', 'lost']).optional(),
  notes: z.string().optional(),
})

export async function createContractAction(formData: FormData) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser()

  // Check limits for Free plan
  if (user.plan === 'free') {
      const { count } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      if (count !== null && count >= 5) {
          return { error: 'Free plan limit reached (5 contracts). Please upgrade to Pro.' }
      }
  }

  const rawData = {
    name: formData.get('name') as string,
    client_id: formData.get('client_id') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    renewal_type: formData.get('renewal_type') as any,
    value_amount: formData.get('value_amount') as any,
    value_period: formData.get('value_period') as any,
    renewal_probability: formData.get('renewal_probability') as any,
    status: formData.get('status') as any || 'active',
    notes: formData.get('notes') as string,
  }

  const validatedFields = contractSchema.safeParse(rawData)

  if (!validatedFields.success) {
    console.error(validatedFields.error)
    return { error: 'Invalid fields' }
  }

  // Verify that the client belongs to the user
  try {
    await assertOwnership('clients', validatedFields.data.client_id, user.id)
  } catch (e) {
    return { error: 'Invalid Client ID or Unauthorized' }
  }

  const { error } = await supabase.from('contracts').insert({
    user_id: user.id,
    ...validatedFields.data,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/contracts')
  return { success: 'Contract created successfully' }
}

export async function updateContractAction(id: string, formData: FormData) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser()
  
  // Defense in Depth: Verify ownership
  try {
    await assertOwnership('contracts', id, user.id)
  } catch (e) {
    return { error: 'Unauthorized: You do not own this contract.' }
  }

  const rawData = {
    name: formData.get('name') as string,
    client_id: formData.get('client_id') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    renewal_type: formData.get('renewal_type') as any,
    value_amount: formData.get('value_amount') as any,
    value_period: formData.get('value_period') as any,
    renewal_probability: formData.get('renewal_probability') as any,
    status: formData.get('status') as any,
    notes: formData.get('notes') as string,
  }

  const validatedFields = contractSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  // Also verify new client ownership if it changed
  try {
    await assertOwnership('clients', validatedFields.data.client_id, user.id)
  } catch (e) {
    return { error: 'Invalid Client ID or Unauthorized' }
  }

  const { error } = await supabase
    .from('contracts')
    .update(validatedFields.data)
    .eq('id', id)
    .eq('user_id', user.id) // Redundant with assertOwnership but safe

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/contracts')
  return { success: 'Contract updated successfully' }
}

export async function deleteContractAction(id: string) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser()

  // Defense in Depth
  try {
    await assertOwnership('contracts', id, user.id)
  } catch (e) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/contracts')
  return { success: 'Contract deleted successfully' }
}
