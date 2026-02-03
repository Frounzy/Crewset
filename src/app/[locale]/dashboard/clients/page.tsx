import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Clients | Crewset',
  robots: { index: false, follow: false },
}
import { createClient } from '@/lib/supabase/server'
import { ClientsClient } from './clients-client'

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

  return (
    <ClientsClient 
      clients={clients as any[] || []} 
      subscriptionPlan={subscriptionPlan}
    />
  )
}
