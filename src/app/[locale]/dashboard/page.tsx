import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, CreditCard, Activity, Lock, AlertTriangle } from "lucide-react"
import { addDays, isAfter, isBefore, parseISO } from 'date-fns'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
  
  const { data: contracts, error } = await supabase
    .from('contracts')
    .select('*, client:clients(name, email)')
    .order('created_at', { ascending: false })
  
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

  const activeContracts = contracts?.filter(c => c.status === 'active') || []
  
  const totalRevenue = activeContracts.reduce((acc, curr) => {
      const value = Number(curr.value_amount) || 0
      return acc + (curr.value_period === 'monthly' ? value * 12 : value)
  }, 0)

  const today = new Date()
  const thirtyDaysFromNow = addDays(today, 30)

  const revenueAtRisk = activeContracts.reduce((acc, curr) => {
      const endDate = parseISO(curr.end_date)
      if (isAfter(endDate, today) && isBefore(endDate, thirtyDaysFromNow)) {
           const value = Number(curr.value_amount) || 0
           return acc + (curr.value_period === 'monthly' ? value * 12 : value)
      }
      return acc
  }, 0)
  
  const expiringCount = activeContracts.filter(curr => {
       const endDate = parseISO(curr.end_date)
       return isAfter(endDate, today) && isBefore(endDate, thirtyDaysFromNow)
  }).length

  const recentContracts = contracts?.slice(0, 5) || []

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
                    {t('contractsExpiringSoon', { count: expiringCount })}
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
             <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md">
                No enough data for chart
             </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Latest contracts added to the platform.
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
                {recentContracts.length === 0 && (
                    <div className="text-sm text-muted-foreground">No contracts found.</div>
                )}
                {recentContracts.map((contract) => (
                    <div className="flex items-center" key={contract.id}>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{contract.name}</p>
                            <p className="text-sm text-muted-foreground">{contract.client?.name}</p>
                        </div>
                        <div className="ml-auto font-medium">
                            {formatCurrency(Number(contract.value_amount))}
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
