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
      {contracts.length === 0 ? (
        <div className="grid gap-6">
          <div className="border-2 border-dashed rounded-lg p-6 sm:p-10 text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Sözleşme ekleyerek takibi başlat</h3>
            <p className="text-muted-foreground mb-4 sm:mb-6">
              Sözleşmeler bitiş tarihlerini, yenileme olasılığını ve gelir risklerini otomatik olarak hesaplamanı sağlar.
            </p>
            <div className="flex items-center justify-center mb-3">
              <ContractDialog
                clients={clients}
                subscriptionPlan={subscriptionPlan}
                currentCount={contracts.length}
                trigger={<button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  İlk Sözleşmeni Oluştur
                </button>}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Sözleşme eklemeden gelir risklerini göremezsin.
            </div>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={contracts} />
      )}
    </div>
  )
}
