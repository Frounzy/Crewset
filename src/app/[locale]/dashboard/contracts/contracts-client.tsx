'use client'

import { DataTable } from './data-table'
import { getColumns, Contract } from './columns'
import { ContractDialog } from './contract-dialog'
import { useTranslations } from 'next-intl'

interface ContractsClientProps {
  contracts: Contract[]
  clients: any[]
  subscriptionPlan: string
}

export function ContractsClient({ contracts, clients, subscriptionPlan }: ContractsClientProps) {
  const t = useTranslations('Contracts')
  const columns = getColumns(clients, t)

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
        <ContractDialog 
          clients={clients} 
          subscriptionPlan={subscriptionPlan}
          currentCount={contracts.length}
        />
      </div>
      <DataTable columns={columns} data={contracts} />
    </div>
  )
}
