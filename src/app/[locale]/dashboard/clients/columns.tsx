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
import { ClientDialog } from './client-dialog'
import { useState } from 'react'
import { deleteClientAction } from './actions'
import { FeedbackLinkDialog } from './feedback-link-dialog'

export type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  created_at: string
  contracts_count?: number
}

export const getColumns = (t: any, subscriptionPlan?: string): ColumnDef<Client>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t ? t('columns.name') || 'Name' : 'Name'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
  },
  {
    accessorKey: 'company',
    header: t ? t('columns.company') || 'Company' : 'Company',
  },
  {
    accessorKey: 'email',
    header: t ? t('columns.email') || 'Email' : 'Email',
  },
  {
    accessorKey: 'phone',
    header: t ? t('columns.phone') || 'Phone' : 'Phone',
  },
  {
    accessorKey: 'contracts_count',
    header: 'Contracts',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const client = row.original
      const [showEditDialog, setShowEditDialog] = useState(false)
      const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

      const handleDelete = async () => {
          if (confirm('Are you sure you want to delete this client?')) {
              await deleteClientAction(client.id)
          }
      }

      const handleFeedback = async () => {
          setShowFeedbackDialog(true)
      }

      return (
        <>
            <ClientDialog 
                client={client} 
                open={showEditDialog} 
                onOpenChange={setShowEditDialog} 
                trigger={null}
            />
            {subscriptionPlan === 'free' ? (
              <Button disabled className="mr-2">
                Feedback İste (Pro)
              </Button>
            ) : (
              <Button 
                className="mr-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                onClick={handleFeedback}
              >
                Feedback İste
              </Button>
            )}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(client.id)}>
                Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
            <FeedbackLinkDialog clientId={client.id} open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} />
        </>
      )
    },
  },
]
