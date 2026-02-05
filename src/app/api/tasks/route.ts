import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { logger } from '@/lib/security/logger'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    logger.warn('Unauthorized tasks GET', undefined)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const rl = await checkRateLimit(`api_tasks_get:${ip}`, 60, 60)
  if (!rl.success) {
    return NextResponse.json({ error: 'rate_limit' }, { status: 429 })
  }
  const admin = createAdminClient()
  const { data: memberOrgRows } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
  const orgIds = (memberOrgRows || []).map((r: any) => r.organization_id)
  let tasks: any[] = []
  if (orgIds.length) {
    const { data: t } = await admin
      .from('tasks')
      .select('*, contract:contracts(name), assignee:profiles!tasks_assignee_id_fkey(full_name, email)')
      .in('organization_id', orgIds)
      .order('due_date', { ascending: true })
    tasks = t || []
  }
  if (!tasks.length) {
    const { data: t2 } = await admin
      .from('tasks')
      .select('*, contract:contracts(name), assignee:profiles!tasks_assignee_id_fkey(full_name, email)')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })
    tasks = t2 || []
  }
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return NextResponse.json({ tasks, meta: { count: tasks.length, projectUrl } })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    logger.warn('Unauthorized tasks DELETE', undefined)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const rl = await checkRateLimit(`api_tasks_delete:${ip}`, 20, 60)
  if (!rl.success) {
    return NextResponse.json({ error: 'rate_limit' }, { status: 429 })
  }
  // CSRF check (double submit cookie)
  const csrfHeader = request.headers.get('x-csrf-token') || ''
  const csrfCookie = (await cookies()).get('csrf_token')?.value || ''
  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    return NextResponse.json({ error: 'csrf_invalid' }, { status: 403 })
  }
  const admin = createAdminClient()
  const { error } = await admin
    .from('tasks')
    .delete()
    .eq('user_id', user.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
