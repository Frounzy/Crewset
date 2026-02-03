import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Reports | Crewset',
  robots: { index: false, follow: false },
}
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ReportsClient } from './reports-client'

export default async function ReportsPage() {
  const t = await getTranslations('Reports')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('user_id', user.id)

  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      <p className="text-muted-foreground">
        {t('description')}
      </p>
      
      <ReportsClient contracts={contracts || []} />
    </div>
  )
}
