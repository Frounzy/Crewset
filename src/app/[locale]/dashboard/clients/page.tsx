import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ClientsRoot } from './clients-root'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch subscription plan
  const { data: { user } } = await supabase.auth.getUser()
  let subscriptionPlan = 'free'
  
  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single()
      
    if (subscription) {
      subscriptionPlan = subscription.plan
    }
  }

  if (error) {
    console.error('Error fetching clients:', JSON.stringify(error, null, 2))
  }

  // Compute contract counts per client
  const { data: contracts } = await supabase
    .from('contracts')
    .select('client_id')
    .eq('user_id', user?.id || '')

  const countMap = new Map<string, number>()
  contracts?.forEach((c: any) => {
    countMap.set(c.client_id, (countMap.get(c.client_id) || 0) + 1)
  })

  const clientsWithCounts = (clients as any[] || []).map((c: any) => ({
    ...c,
    contracts_count: countMap.get(c.id) || 0,
  }))

  return (
    <ClientsRoot 
      clients={clientsWithCounts} 
      subscriptionPlan={subscriptionPlan}
    />
  )
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const tSeo = await getTranslations('SEO.DashboardClients')
  return {
    title: tSeo('title'),
    description: tSeo('description'),
    robots: { index: false, follow: false },
  }
}
