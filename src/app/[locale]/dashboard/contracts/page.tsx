import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Contracts | Crewset',
  robots: { index: false, follow: false },
}
import { createClient } from '@/lib/supabase/server'
import { ContractsClient } from './contracts-client'

export default async function ContractsPage() {
  const supabase = await createClient()

  // Fetch contracts with client details
  const { data: contracts, error: contractsError } = await supabase
    .from('contracts')
    .select('*, client:clients(name)')
    .order('created_at', { ascending: false })

  // Fetch clients for the dialog dropdown
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })

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

  if (contractsError) {
    console.error('Error fetching contracts:', JSON.stringify(contractsError, null, 2))
  }
  
  if (clientsError) {
      console.error('Error fetching clients for contracts:', JSON.stringify(clientsError, null, 2))
  }

  return (
    <ContractsClient 
      contracts={contracts as any[] || []} 
      clients={clients || []}
      subscriptionPlan={subscriptionPlan}
    />
  )
}
