import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { BillingClient } from './billing-client'

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('billing_company_name, billing_tax_id, billing_tax_office, billing_address')
    .eq('id', user?.id)
    .single()

  return <BillingClient subscription={subscription} profile={profile} />
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const tSeo = await getTranslations('SEO.DashboardBilling')
  return {
    title: tSeo('title'),
    description: tSeo('description'),
    robots: { index: false, follow: false },
  }
}
