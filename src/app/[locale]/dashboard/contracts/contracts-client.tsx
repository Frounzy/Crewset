'use client'

import { DataTable } from './data-table'
import { getColumns, Contract } from './columns'
import { ContractDialog } from './contract-dialog'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface ContractsClientProps {
  contracts: Contract[]
  clients: any[]
  subscriptionPlan: string
}

export function ContractsClient({ contracts, clients, subscriptionPlan }: ContractsClientProps) {
  const t = useTranslations('Contracts')
  const columns = getColumns(clients, t, subscriptionPlan)
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialId = searchParams.get('contractId')
  const [openFromFeed, setOpenFromFeed] = useState<boolean>(false)
  const initialContract = useMemo(
    () => contracts.find((c) => c.id === initialId) || undefined,
    [contracts, initialId]
  )
  
  useEffect(() => {
    if (initialId && initialContract) {
      setOpenFromFeed(true)
    }
  }, [initialId, initialContract])
  
  const handleDialogChange = (o: boolean) => {
    setOpenFromFeed(o)
    if (!o && initialId) {
      const sp = new URLSearchParams(Array.from(searchParams.entries()))
      sp.delete('contractId')
      router.replace(`/dashboard/contracts?${sp.toString()}`)
    }
  }

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
      {initialContract && (
        <ContractDialog 
          contract={initialContract}
          clients={clients}
          open={openFromFeed}
          onOpenChange={handleDialogChange}
          subscriptionPlan={subscriptionPlan}
          currentCount={contracts.length}
        />
      )}
      <DataTable columns={columns} data={contracts} />
    </div>
  )
}
