'use client'

import { DataTable } from './data-table'
import { columns, Client } from './columns'
import { ClientDialog } from './client-dialog'
import { useTranslations } from 'next-intl'

interface ClientsClientProps {
  clients: Client[]
  subscriptionPlan: string
}

export function ClientsClient({ clients, subscriptionPlan }: ClientsClientProps) {
  const t = useTranslations('Clients')

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        <ClientDialog 
          subscriptionPlan={subscriptionPlan}
          currentCount={clients.length}
        />
      </div>
      <DataTable columns={columns} data={clients} />
    </div>
  )
}
