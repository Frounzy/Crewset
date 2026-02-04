import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, CreditCard, Activity, Lock, AlertTriangle } from "lucide-react"
import { addDays, isAfter, isBefore, parseISO, differenceInCalendarDays } from 'date-fns'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OverviewClient } from './overview-client'
import { ActivityFeedClient, ActivityEvent } from './activity-feed-client'

export const metadata: Metadata = {
  title: 'Dashboard | Crewset',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function DashboardPage() {
  const t = await getTranslations('Dashboard')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  type ContractRow = {
    id: string
    name: string
    status: string
    end_date: string
    value_amount: number
    value_period: 'monthly' | 'yearly'
    created_at?: string
    updated_at?: string
    client?: { name: string | null; email: string | null }
  }

  const { data: contracts, error } = await supabase
    .from('contracts')
    .select('*, client:clients(name, email)')
    .order('created_at', { ascending: false })
  
  // Sign events (used_at indicates signature completed)
  let signMap = new Map<string, string>()
  if (contracts && contracts.length > 0) {
    const contractIds = (contracts as any[]).map((c: any) => c.id)
    const { data: links } = await supabase
      .from('contract_sign_links')
      .select('contract_id, used_at')
      .in('contract_id', contractIds)
    links?.forEach((l: any) => {
      if (l.used_at) {
        // keep latest used_at per contract
        const prev = signMap.get(l.contract_id)
        if (!prev || new Date(l.used_at).getTime() > new Date(prev).getTime()) {
          signMap.set(l.contract_id, l.used_at)
        }
      }
    })
  }
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user?.id)
    .single()
  
  const plan = subscription?.plan || 'free'
  
  if (error) {
      console.error('Dashboard Error:', JSON.stringify(error, null, 2))
      console.error('Error details:', error)
  }

  const typedContracts: ContractRow[] = (contracts || []) as unknown as ContractRow[]
  const activeContracts: ContractRow[] = typedContracts.filter((c: ContractRow) => c.status === 'active')
  
  const totalRevenue = activeContracts.reduce((acc: number, curr: ContractRow) => {
    const value = Number(curr.value_amount) || 0
    return acc + (curr.value_period === 'monthly' ? value * 12 : value)
  }, 0)

  const today = new Date()
  const thirtyDaysFromNow = addDays(today, 30)

  const revenueAtRisk = activeContracts.reduce((acc: number, curr: ContractRow) => {
    const endDate = parseISO(curr.end_date)
    if (isAfter(endDate, today) && isBefore(endDate, thirtyDaysFromNow)) {
      const value = Number(curr.value_amount) || 0
      return acc + (curr.value_period === 'monthly' ? value * 12 : value)
    }
    return acc
  }, 0)
  
  const expiringCount = activeContracts.filter((curr: ContractRow) => {
    const endDate = parseISO(curr.end_date)
    return isAfter(endDate, today) && isBefore(endDate, thirtyDaysFromNow)
  }).length
  
  let nearestDays = 0
  const expiringDays = activeContracts
    .map((curr: ContractRow) => {
      const endDate = parseISO(curr.end_date)
      if (isAfter(endDate, today) && isBefore(endDate, thirtyDaysFromNow)) {
        const daysLeft = Math.max(0, differenceInCalendarDays(endDate, today))
        return daysLeft
      }
      return null
    })
    .filter((d): d is number => d !== null)
  
  if (expiringDays.length > 0) {
    nearestDays = Math.min(...expiringDays)
  }

  // Build Activity events
  const activityEvents: ActivityEvent[] = []
  for (const c of typedContracts) {
    if (c.created_at) {
      activityEvents.push({
        id: c.id,
        type: 'created',
        contractId: c.id,
        contractName: c.name,
        clientName: c.client?.name,
        at: c.created_at,
      })
    }
    const signedAt = signMap.get(c.id)
    if (signedAt) {
      activityEvents.push({
        id: c.id,
        type: 'signed',
        contractId: c.id,
        contractName: c.name,
        clientName: c.client?.name,
        at: signedAt,
      })
    }
    if (c.status === 'renewed' && c.updated_at) {
      activityEvents.push({
        id: c.id,
        type: 'renewed',
        contractId: c.id,
        contractName: c.name,
        clientName: c.client?.name,
        at: c.updated_at,
      })
    }
    const endDate = parseISO(c.end_date)
    if (c.status === 'active' && isAfter(endDate, today) && isBefore(endDate, thirtyDaysFromNow)) {
      activityEvents.push({
        id: c.id,
        type: 'expiring',
        contractId: c.id,
        contractName: c.name,
        clientName: c.client?.name,
        at: c.end_date,
      })
    }
  }
  
  // Fetch tasks for dashboard widgets and task activities
  const { data: subOrg } = await supabase
    .from('subscriptions')
    .select('organization_id')
    .eq('user_id', user?.id || '')
    .single()
  const orgId = subOrg?.organization_id
  
  let tasks: any[] = []
  let taskActivities: any[] = []
  if (orgId) {
    const { data: t } = await supabase
      .from('tasks')
      .select('*, assignee:profiles(full_name, email), contract:contracts(name)')
      .eq('organization_id', orgId)
      .order('due_date', { ascending: true })
    tasks = t || []
    
    const { data: ta } = await supabase
      .from('task_activities')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10)
    taskActivities = ta || []
  }
  
  // Merge task activities into activity feed
  for (const a of taskActivities) {
    const base = {
      id: a.task_id,
      contractId: a.task_id,
      contractName: tasks.find((t: any) => t.id === a.task_id)?.title || 'Görev',
      clientName: tasks.find((t: any) => t.id === a.task_id)?.assignee?.full_name || tasks.find((t: any) => t.id === a.task_id)?.assignee?.email,
      at: a.created_at,
    }
    if (a.action === 'task_created') {
      activityEvents.push({ ...base, type: 'task_created' })
    } else if (a.action === 'task_assigned') {
      activityEvents.push({ ...base, type: 'task_assigned' })
    } else if (a.action === 'task_completed') {
      activityEvents.push({ ...base, type: 'task_completed' })
    }
  }

  const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
      }).format(amount)
  }

  return (
    <div className="flex-1 space-y-4">
      {subscription?.status === 'past_due' && (
         <div className="bg-destructive/15 text-destructive p-4 rounded-md border border-destructive/50 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <p className="font-medium">{t('paymentFailed') || 'Your subscription payment failed. Please update your payment method.'}</p>
            <Button variant="link" asChild className="ml-auto text-destructive underline">
                <Link href="/dashboard/billing">{t('updateBilling') || 'Update Billing'}</Link>
            </Button>
         </div>
      )}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalAnnualRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {t('acrossActiveContracts', { count: activeContracts.length })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('activeContracts')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('totalActiveContracts')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('revenueAtRisk')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {plan === 'free' ? (
                <div className="flex flex-col gap-1 relative overflow-hidden">
                     <div className="text-2xl font-bold text-red-500 blur-sm select-none">$12,345.00</div>
                     <p className="text-xs text-muted-foreground blur-sm select-none">3 contracts expiring</p>
                     <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <div className="flex items-center text-xs font-medium text-primary bg-background border px-2 py-1 rounded-full shadow-sm">
                            <Lock className="w-3 h-3 mr-1" /> {t('upgradeToPro')}
                        </div>
                     </div>
                </div>
            ) : (
                <>
                    <div className="text-2xl font-bold text-red-500">{formatCurrency(revenueAtRisk)}</div>
                    <p className="text-xs text-muted-foreground">
                    {t('contractsExpiringSoon', { count: expiringCount, days: nearestDays || 30 })}
                    </p>
                </>
            )}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('subscriptionPlan')}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{plan}</div>
            <p className="text-xs text-muted-foreground">
              {t('currentPlan', { plan: plan })}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewClient contracts={activeContracts as any[]} />
          </CardContent>
        </Card>
        <div className="col-span-3 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Bana Atanan Görevler</h3>
            <div className="space-y-2">
              {tasks.filter((t: any) => t.assignee_id === user?.id).slice(0,5).map((t: any) => (
                <Link key={t.id} href={`/dashboard/tasks/${t.id}`} className="block">
                  <div className="flex items-center gap-3 p-2 rounded-lg border hover:border-primary/40 transition-colors">
                    <div className="ml-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.contract?.name || 'Görev'} • {new Date(t.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {tasks.filter((t: any) => t.assignee_id === user?.id).length === 0 && (
                <div className="text-sm text-muted-foreground">Size atanmış görev yok.</div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{t('recentActivity')}</h3>
          </div>
          <ActivityFeedClient events={activityEvents} />
        </div>
      </div>
    </div>
  )
}
