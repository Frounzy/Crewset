import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TasksClient } from './tasks-client'
import { notFound } from 'next/navigation'
 
 export default async function TasksPage() {
   const t = await getTranslations('Tasks')
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) return notFound()
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
    if (orgId) {
      const { data: existingProfile } = await admin
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      if (!existingProfile) {
        await admin.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: null,
          avatar_url: null,
        })
      }
      const { error: addMembershipError } = await admin
        .from('organization_members')
        .insert({
          organization_id: orgId,
          user_id: user.id,
          role: 'owner',
        })
      if (addMembershipError && addMembershipError.code !== '23505') {
        // noop
      }
    }
  }
 
  const { data: memberOrgRows } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
  const memberOrgIds = (memberOrgRows || []).map((r: any) => r.organization_id)
  const orgIdsForFetch = memberOrgIds.length ? memberOrgIds : (orgId ? [orgId] : [])
  let tasks: any[] = []
  let orgLogos: Record<string, string | null> = {}
  if (orgIdsForFetch.length) {
    const { data: t, error: adminErr } = await admin
      .from('tasks')
      .select('*, contract:contracts(name), assignee:profiles!tasks_assignee_id_fkey(full_name, email)')
      .in('organization_id', orgIdsForFetch)
      .order('due_date', { ascending: true })
    tasks = t || []
    const { data: orgs } = await admin
      .from('organizations')
      .select('id, logo_url')
      .in('id', orgIdsForFetch)
    ;(orgs || []).forEach((o: any) => {
      orgLogos[o.id] = o.logo_url || null
    })
    if ((adminErr || !t) && orgIdsForFetch.length) {
      const { data: t2 } = await supabase
        .from('tasks')
        .select('*, contract:contracts(name), assignee:profiles!tasks_assignee_id_fkey(full_name, email)')
        .in('organization_id', orgIdsForFetch)
        .order('due_date', { ascending: true })
      tasks = t2 || []
    }
  }
  if (!tasks.length) {
    const { data: t3 } = await admin
      .from('tasks')
      .select('*, contract:contracts(name), assignee:profiles!tasks_assignee_id_fkey(full_name, email)')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })
    tasks = t3 || []
  }
 
  let members: any[] = []
  let contracts: any[] = []
  let meProfile: any = null
  if (orgId) {
    const { data: memberRows } = await admin
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', orgId)
    const memberIds = (memberRows || []).map((m: any) => m.user_id)
    if (memberIds.length) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', memberIds)
      const profileMap: Record<string, any> = Object.create(null)
      ;(profiles || []).forEach((p: any) => {
        profileMap[p.id] = p
      })
      members = memberIds.map((id: string) => ({
        user_id: id,
        profile: profileMap[id] || null,
      }))
    } else {
      members = []
    }
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
  return <TasksClient tasks={tasks || []} currentUserId={user.id} members={members} contracts={contracts} orgLogos={orgLogos} />
}
 
 
 
 
 
