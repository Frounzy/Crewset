import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TasksClient } from './tasks-client'
 
 export default async function TasksPage() {
   const t = await getTranslations('Tasks')
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) return null
 
  const admin = createAdminClient()
  const { data: memberships } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
  let orgId = memberships?.[0]?.organization_id || null
  if (!orgId) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()
    orgId = sub?.organization_id || null
  }
 
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, contract:contracts(name), assignee:profiles(full_name, email)')
    .eq('organization_id', orgId || '')
    .order('due_date', { ascending: true })
 
  let members: any[] = []
  let contracts: any[] = []
  let meProfile: any = null
  if (orgId) {
    const { data: orgMembers } = await admin
      .from('organization_members')
      .select('user_id, profile:profiles(full_name, email)')
      .eq('organization_id', orgId)
    members = orgMembers || []
    const { data: orgContracts } = await admin
      .from('contracts')
      .select('id, name, user_id, organization_id')
      .or(`organization_id.eq.${orgId},user_id.eq.${user.id}`)
      .order('name', { ascending: true })
    contracts = (orgContracts || []).map((c: any) => ({ id: c.id, name: c.name }))
  }
  const { data: myProf } = await admin
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', user.id)
    .single()
  meProfile = myProf || { id: user.id, email: user.email }
  return <TasksClient tasks={tasks || []} currentUserId={user.id} members={members} contracts={contracts} />
  return <TasksClient tasks={tasks || []} currentUserId={user.id} members={members} contracts={contracts} currentUser={meProfile} />
 
 
 
 
 
