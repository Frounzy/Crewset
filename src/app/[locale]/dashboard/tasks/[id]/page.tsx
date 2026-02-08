import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { updateTaskStatusAction, updateTaskProgressAction, addTaskNoteAction } from '../actions'
import { Input } from '@/components/ui/input'
import { redirect } from 'next/navigation'
import { CheckCircle2, Clock, User as UserIcon, FileText } from 'lucide-react'

export default async function TaskDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id, locale } = await params
  const t = await getTranslations('Tasks')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const admin = createAdminClient()
  const { data: memberOrgRows } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
  const memberOrgIds = (memberOrgRows || []).map((r: any) => r.organization_id)
  const { data: subOrg } = await supabase
    .from('subscriptions')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()
  const fallbackOrg = subOrg?.organization_id || null
  const orgIdsForFetch = memberOrgIds.length ? memberOrgIds : (fallbackOrg ? [fallbackOrg] : [])

  let task: any = null
  if (orgIdsForFetch.length) {
    const { data } = await admin
      .from('tasks')
      .select('*, contract:contracts(name), assignee:profiles!tasks_assignee_id_fkey(full_name, email), organization_id')
      .eq('id', id)
      .in('organization_id', orgIdsForFetch)
      .limit(1)
    task = (data || [])[0] || null
  }
  if (!task) {
    const { data } = await admin
      .from('tasks')
      .select('*, contract:contracts(name), assignee:profiles!tasks_assignee_id_fkey(full_name, email)')
      .eq('id', id)
      .eq('user_id', user.id)
      .limit(1)
    task = (data || [])[0] || null
  }
  if (!task) return notFound()

  const logoUrl = await (async () => {
    if (!task.organization_id) return ''
    const { data: org } = await admin
      .from('organizations')
      .select('logo_url')
      .eq('id', task.organization_id)
      .single()
    return org?.logo_url || ''
  })()

  const due = task.due_date ? new Date(task.due_date) : null
  const assigneeLabel = task.assignee?.full_name || task.assignee?.email || ''
  const statusVariant = task.status === 'completed' ? 'secondary' : 'outline'
  const { data: activities } = await admin
    .from('task_activities')
    .select('created_at, action, details, actor:profiles(full_name, email)')
    .eq('task_id', id)
    .order('created_at', { ascending: false })
  const isDoing = (activities || [])[0]?.action === 'task_progress_updated' && task.status !== 'completed'

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        <Button asChild variant="outline">
          <Link href="/dashboard/tasks">{t('back') || 'Görevlere Dön'}</Link>
        </Button>
      </div>
      <Card className="border p-6 md:p-8 space-y-6">
        <CardHeader className="flex items-center gap-4">
          {logoUrl ? (
            <div className="relative h-12 w-12 rounded-full overflow-hidden ring-1 ring-border">
              <Image src={logoUrl} alt="Org" fill className="object-cover" />
            </div>
          ) : null}
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <span className="text-xl md:text-2xl">{task.title}</span>
              <Badge variant={statusVariant}>{task.status === 'completed' ? 'Tamamlandı' : 'Açık'}</Badge>
              {isDoing && <Badge>Yapılıyor</Badge>}
            </CardTitle>
            <div className="text-sm text-muted-foreground flex items-center gap-3 mt-2">
              {task.contract?.name ? (
                <span className="inline-flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {task.contract.name}
                </span>
              ) : null}
              {due ? (
                <span className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(due, 'dd MMM yyyy')}
                </span>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {assigneeLabel && (
            <div className="text-sm flex items-center gap-2">
              <span className="font-medium inline-flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Atanan:
              </span>
              <span className="text-muted-foreground">{assigneeLabel}</span>
            </div>
          )}
          {task.description && (
            <div className="text-sm">
              <span className="font-medium inline-flex items-center gap-2">
                <FileText className="w-4 h-4" /> Açıklama:
              </span>{' '}
              <span className="text-muted-foreground">{task.description}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <form
              action={async () => {
                'use server'
                await updateTaskProgressAction(id, 'doing')
                redirect(`/${locale}/dashboard/tasks/${id}`)
              }}
            >
              <Button size="sm" variant={isDoing ? 'default' : 'outline'} type="submit">Yapılıyor</Button>
            </form>
            <form
              action={async () => {
                'use server'
                await updateTaskStatusAction(id, 'completed')
                redirect(`/${locale}/dashboard/tasks/${id}`)
              }}
            >
              <Button size="sm" variant={task.status === 'completed' ? 'secondary' : 'outline'} type="submit">Yapıldı</Button>
            </form>
            <form
              action={async () => {
                'use server'
                await updateTaskStatusAction(id, 'completed')
                redirect(`/${locale}/dashboard/tasks/${id}`)
              }}
            >
              <Button size="sm" variant={task.status === 'completed' ? 'secondary' : 'outline'} type="submit">Bitti</Button>
            </form>
            {task.status === 'completed' && (
              <form
                action={async () => {
                  'use server'
                  await updateTaskStatusAction(id, 'open')
                  redirect(`/${locale}/dashboard/tasks/${id}`)
                }}
              >
                <Button size="sm" variant="outline" type="submit">Yeniden Aç</Button>
              </form>
            )}
          </div>
          <div className="pt-6 space-y-3">
            <div className="text-sm font-medium">Not bırak</div>
            <form
              action={async (fd: FormData) => {
                'use server'
                await addTaskNoteAction(fd)
                redirect(`/${locale}/dashboard/tasks/${id}`)
              }}
              className="flex items-center gap-2"
            >
              <input type="hidden" name="task_id" value={id} />
              <Input name="note" placeholder="Kısa bir not bırakın..." className="flex-1" />
              <Button type="submit" size="sm">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Kaydet
              </Button>
            </form>
            <div className="space-y-2">
              {(activities || []).map((a: any, idx: number) => {
                const actor = a.actor?.full_name || a.actor?.email || 'Anonim'
                const time = format(new Date(a.created_at), 'dd MMM yyyy HH:mm')
                let content = ''
                if (a.action === 'task_note_added') {
                  content =
                    typeof a.details === 'string'
                      ? a.details
                      : (a.details?.note || '')
                } else if (a.action === 'task_completed') {
                  content = 'Görev tamamlandı'
                } else if (a.action === 'task_progress_updated') {
                  content = 'Görev yapılıyor'
                } else if (a.action === 'task_assigned') {
                  content = 'Görev atanmış'
                } else if (a.action === 'task_created') {
                  content = 'Görev oluşturuldu'
                }
                return (
                  <div key={idx} className="text-sm p-3 rounded-lg border bg-muted/30">
                    <div className="text-muted-foreground mb-1">{actor + ' • ' + time}</div>
                    <div>{content}</div>
                  </div>
                )
              })}
              {!(activities || []).length && (
                <div className="text-xs text-muted-foreground">Henüz aktivite yok.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
