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
      {!(contracts || []).some((c: any) => c.status === 'active') ? (
        <div className="grid gap-6">
          <div className="border-2 border-dashed rounded-lg p-10 text-center">
            <h3 className="text-xl font-semibold mb-2">Raporları görmek için bir adım kaldı</h3>
            <p className="text-muted-foreground mb-6">
              En az bir aktif sözleşme eklediğinde gelir dağılımını ve sözleşme performansını burada görebilirsin.
            </p>
            <div className="flex items-center justify-center mb-3">
              <a href="/dashboard/contracts" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                Sözleşme Ekle
              </a>
            </div>
            <div className="text-xs text-muted-foreground">
              Raporlar otomatik olarak güncellenir.
            </div>
          </div>
        </div>
      ) : (
        <ReportsClient contracts={contracts || []} />
      )}
    </div>
  )
}
