'use server'
 
 import { createClient } from '@/lib/supabase/server'
 import { revalidatePath } from 'next/cache'
 import { z } from 'zod'
 import { getAuthenticatedUser } from '@/lib/security/auth'
import { createAdminClient } from '@/lib/supabase/admin'
 
 function sanitize(input?: string | null) {
   if (!input) return input || null
   return input
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&#39;')
     .trim()
 }
 
 const createSchema = z.object({
   title: z.string().min(1),
   description: z.string().optional(),
   contract_id: z.string().uuid().optional(),
   assignee_id: z.string().uuid().optional(),
   due_date: z.string().refine((d) => !isNaN(Date.parse(d))),
 })
 
 const statusSchema = z.enum(['open', 'completed'])
 
 async function getOrganizationIdForUser(userId: string) {
  const admin = createAdminClient()
  const { data: memberships } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
  const orgId = memberships?.[0]?.organization_id || null
  if (orgId) return orgId
  const supabase = await createClient()
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('organization_id')
    .eq('user_id', userId)
    .single()
  return sub?.organization_id || null
 }
 
 export async function createTaskAction(formData: FormData) {
  const supabase = await createClient()
   const user = await getAuthenticatedUser()
   const orgId = await getOrganizationIdForUser(user.id)
   if (!orgId) return { error: 'Organizasyon bulunamadı' }
 
   const raw = {
     title: formData.get('title') as string,
     description: (formData.get('description') as string) || undefined,
     contract_id: (formData.get('contract_id') as string) || undefined,
     assignee_id: (formData.get('assignee_id') as string) || undefined,
     due_date: formData.get('due_date') as string,
   }
   const parsed = createSchema.safeParse(raw)
   if (!parsed.success) return { error: 'Geçersiz alanlar' }
 
  const admin = createAdminClient()
  const { error, data } = await admin
     .from('tasks')
    .insert({
       organization_id: orgId,
       user_id: user.id,
       contract_id: parsed.data.contract_id || null,
       title: sanitize(parsed.data.title) || '',
       description: sanitize(parsed.data.description) || null,
       assignee_id: parsed.data.assignee_id || null,
       due_date: parsed.data.due_date,
       status: 'open',
     })
    .select('*, assignee:profiles!tasks_assignee_id_fkey(full_name, email), contract:contracts(name)')
     .single()
 
   if (error) return { error: error.message }
 
  await admin.from('task_activities').insert({
     organization_id: orgId,
     task_id: data.id,
     actor_id: user.id,
     action: 'task_created',
     details: { title: data.title },
   })
 
   revalidatePath('/dashboard/tasks')
   revalidatePath('/dashboard')
  return { success: true, task: data }
 }
 
 export async function assignTaskAction(id: string, assigneeId: string) {
  const admin = createAdminClient()
   const user = await getAuthenticatedUser()
   const orgId = await getOrganizationIdForUser(user.id)
   if (!orgId) return { error: 'Organizasyon bulunamadı' }
 
 // Ownership/org check
 const { data: taskRow, error: fetchErr } = await admin
   .from('tasks')
   .select('organization_id')
   .eq('id', id)
   .single()
 if (fetchErr || !taskRow || taskRow.organization_id !== orgId) {
   return { error: 'Yetkisiz erişim' }
 }
 
  const { error } = await admin
     .from('tasks')
     .update({
       assignee_id: assigneeId,
     })
     .eq('id', id)
 
   if (error) return { error: error.message }
 
  await admin.from('task_activities').insert({
     organization_id: orgId,
     task_id: id,
     actor_id: user.id,
     action: 'task_assigned',
     details: { assignee_id: assigneeId },
   })
 
   revalidatePath('/dashboard/tasks')
   revalidatePath('/dashboard')
   return { success: true }
 }
 
 export async function updateTaskStatusAction(id: string, status: 'open' | 'completed') {
  const admin = createAdminClient()
   const user = await getAuthenticatedUser()
   const orgId = await getOrganizationIdForUser(user.id)
   if (!orgId) return { error: 'Organizasyon bulunamadı' }
 
   if (!statusSchema.safeParse(status).success) return { error: 'Geçersiz durum' }
 
 // Ownership/org check
 const { data: taskRow, error: fetchErr } = await admin
   .from('tasks')
   .select('organization_id')
   .eq('id', id)
   .single()
 if (fetchErr || !taskRow || taskRow.organization_id !== orgId) {
   return { error: 'Yetkisiz erişim' }
 }
 
  const { error } = await admin
     .from('tasks')
     .update({ status })
     .eq('id', id)
 
   if (error) return { error: error.message }
 
   if (status === 'completed') {
    await admin.from('task_activities').insert({
       organization_id: orgId,
       task_id: id,
       actor_id: user.id,
       action: 'task_completed',
     })
   }
 
   revalidatePath('/dashboard/tasks')
   revalidatePath('/dashboard')
   return { success: true }
 }
 
