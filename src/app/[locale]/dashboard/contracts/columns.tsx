'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ContractDialog } from './contract-dialog'
import { useState } from 'react'
import { deleteContractAction, endContractAction } from './actions'
import { SignLinkDialog } from './sign-link-dialog'
import { format, differenceInDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export type Contract = {
  id: string
  name: string
  client_id: string
  start_date: string
  end_date: string
  renewal_type: 'auto-renew' | 'manual'
  value_amount: number
  value_period: 'monthly' | 'yearly'
  renewal_probability: 'low' | 'medium' | 'high'
  status: 'active' | 'expired' | 'renewed' | 'lost'
  notes: string | null
  created_at: string
  client?: {
      name: string
  }
  signature_signed?: boolean
}

export const getColumns = (clients: any[], t: any, subscriptionPlan?: string): ColumnDef<Contract>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('columns.name')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
  },
  {
    accessorKey: 'client.name', // Assuming we join client data
    header: t('columns.client'),
    cell: ({ row }) => {
        // If client data is joined, use it. If not, lookup from clients array (if passed)
        // For now assume Supabase join
        const clientName = row.original.client?.name || 'Unknown'
        return <div>{clientName}</div>
    }
  },
  {
    accessorKey: 'end_date',
    header: t('columns.endDate'),
    cell: ({ row }) => {
        const endDate = new Date(row.getValue('end_date'))
        const daysLeft = differenceInDays(endDate, new Date())
        
        let colorClass = ''
        if (daysLeft < 0) colorClass = 'text-red-600 font-bold'
        else if (daysLeft <= 30) colorClass = 'text-amber-600 font-semibold'
        
        return <div className={colorClass}>{format(endDate, 'MMM d, yyyy')}</div>
    }
  },
  {
    accessorKey: 'value_amount',
    header: t('columns.value'),
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue('value_amount'))
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
        return <div>{formatted} / {row.original.value_period === 'monthly' ? t('monthly') : t('yearly')}</div>
    }
  },
  {
    accessorKey: 'status',
    header: t('columns.status'),
    cell: ({ row }) => {
        let status = row.getValue('status') as string
        const endDate = new Date(row.original.end_date)
        const isExpiredByDate = differenceInDays(endDate, new Date()) < 0
        
        // Visual override for active but expired by date contracts
        if (status === 'active' && isExpiredByDate) {
            status = 'expired'
        }

        let variant: "default" | "secondary" | "destructive" | "outline" = "default"
        if (status === 'expired' || status === 'lost') variant = "destructive"
        else if (status === 'renewed') variant = "outline"
        else if (status !== 'active') variant = "secondary"

        // Translate status
        const label = t(`status.${status}`) || status.toUpperCase()

        return (
            <Badge variant={variant}>
                {label}
            </Badge>
        )
    }
  },
  {
    accessorKey: 'signature_signed',
    header: 'İmza',
    cell: ({ row }) => {
      const signed = !!row.original.signature_signed
      return <Badge variant={signed ? 'outline' : 'secondary'}>{signed ? 'Onaylandı' : 'Bekliyor'}</Badge>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const contract = row.original
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showEditDialog, setShowEditDialog] = useState(false)
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showSignDialog, setShowSignDialog] = useState(false)

      const handleDelete = async () => {
          if (confirm('Are you sure you want to delete this contract?')) {
              await deleteContractAction(contract.id)
          }
      }
      
      const handleEnd = async () => {
          if (confirm('Sözleşmeyi şimdi bitirmek istediğinize emin misiniz?')) {
              await endContractAction(contract.id)
          }
      }
      
      const handleCreateSignLink = async () => {
          setShowSignDialog(true)
      }

      return (
        <>
            <ContractDialog 
                contract={contract} 
                clients={clients}
                open={showEditDialog} 
                onOpenChange={setShowEditDialog} 
            />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(contract.id)}>
                Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>Edit</DropdownMenuItem>
                {subscriptionPlan === 'free' ? (
                  <DropdownMenuItem disabled>İmza Linki Oluştur (Pro)</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleCreateSignLink}>İmza Linki Oluştur</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleEnd}>Bitir</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
            <SignLinkDialog contractId={contract.id} open={showSignDialog} onOpenChange={setShowSignDialog} />
        </>
      )
    },
  },
]
