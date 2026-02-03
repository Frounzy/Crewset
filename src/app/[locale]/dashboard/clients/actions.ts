'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/security/auth'

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^[+()0-9\s-]{7,20}$/.test(val), {
      message: 'Invalid phone number',
    }),
  company: z.string().max(100, 'Company name too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
})

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser()

  // Check limits for Free plan
  if (user.plan === 'free') {
      const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      if (count !== null && count >= 3) {
          return { error: 'Free plan limit reached (3 clients). Please upgrade to Pro.' }
      }
  }

  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    company: formData.get('company') as string,
    notes: formData.get('notes') as string,
  }

  const validatedFields = clientSchema.safeParse(rawData)

  if (!validatedFields.success) {
    const firstIssue = validatedFields.error.issues?.[0]
    return { error: 'Invalid fields: ' + (firstIssue?.message || 'Validation error') }
  }

  const { error } = await supabase.from('clients').insert({
    user_id: user.id,
    ...validatedFields.data,
  })

  if (error) {
    console.error('Database Error:', error)
    return { error: 'Failed to create client.' }
  }

  revalidatePath('/dashboard/clients')
  return { success: 'Client created successfully' }
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser()
  
  // Verify ownership explicitly before update (Defense in Depth)
  const { data: existingClient } = await supabase
    .from('clients')
    .select('user_id')
    .eq('id', id)
    .single()
    
  if (!existingClient || existingClient.user_id !== user.id) {
    return { error: 'Unauthorized: You do not own this client.' }
  }

  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    company: formData.get('company') as string,
    notes: formData.get('notes') as string,
  }

  const validatedFields = clientSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const { error } = await supabase
    .from('clients')
    .update(validatedFields.data)
    .eq('id', id)
    .eq('user_id', user.id) // Double check in query

  if (error) {
    return { error: 'Failed to update client.' }
  }

  revalidatePath('/dashboard/clients')
  return { success: 'Client updated successfully' }
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // RLS handles this, but explicit check is safer

  if (error) {
    return { error: 'Failed to delete client.' }
  }

  revalidatePath('/dashboard/clients')
  return { success: 'Client deleted successfully' }
}
