'use client'

import { DataTable } from './data-table'
import { getColumns, Client } from './columns'
import { ClientDialog } from './client-dialog'
import { useTranslations } from 'next-intl'

interface ClientsClientProps {
  clients: Client[]
  subscriptionPlan: string
}

export function ClientsClient({ clients, subscriptionPlan }: ClientsClientProps) {
  const t = useTranslations('Clients')
  const columns = getColumns(t, subscriptionPlan)

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        <ClientDialog 
          subscriptionPlan={subscriptionPlan}
          currentCount={clients.length}
        />
      </div>
      {clients.length === 0 ? (
        <div className="grid gap-6">
          <div className="border-2 border-dashed rounded-lg p-10 text-center">
            <h3 className="text-xl font-semibold mb-2">Müşterilerin burada listelenir</h3>
            <p className="text-muted-foreground mb-6">
              Tüm müşterilerini tek bir yerde topla, sözleşmelerini ve görevlerini karışıklık yaşamadan yönet.
            </p>
            <div className="flex items-center justify-center mb-3">
              <ClientDialog
                subscriptionPlan={subscriptionPlan}
                currentCount={clients.length}
                trigger={<button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  Müşteri Ekle
                </button>}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Bir müşteri ekledikten sonra sözleşme ve görev oluşturabilirsin.
            </div>
          </div>
        </div>
      ) : (
      <DataTable columns={columns} data={clients} />
      )}
    </div>
  )
}
