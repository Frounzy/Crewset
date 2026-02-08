import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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

  // Compute signature status (any used sign link)
  const signedSet = new Set<string>()
  if (contracts && contracts.length > 0) {
    const contractIds = contracts.map((c: any) => c.id)
    const { data: links } = await supabase
      .from('contract_sign_links')
      .select('contract_id, used_at')
      .in('contract_id', contractIds)
    links?.forEach((l: any) => {
      if (l.used_at) signedSet.add(l.contract_id)
    })
    contracts.forEach((c: any) => {
      c.signature_signed = signedSet.has(c.id)
    })
  }

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

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const tSeo = await getTranslations('SEO.DashboardContracts')
  return {
    title: tSeo('title'),
    description: tSeo('description'),
    robots: { index: false, follow: false },
  }
}
