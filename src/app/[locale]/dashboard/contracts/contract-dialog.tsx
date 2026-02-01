'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Plus } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { createContractAction, updateContractAction } from './actions'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  client_id: z.string().uuid('Client is required'),
  start_date: z.date(),
  end_date: z.date(),
  renewal_type: z.enum(['auto-renew', 'manual']),
  value_amount: z.coerce.number().min(0, 'Value must be positive'),
  value_period: z.enum(['monthly', 'yearly']),
  renewal_probability: z.enum(['low', 'medium', 'high']),
  notes: z.string().optional(),
})

interface Client {
  id: string
  name: string
}

interface Contract {
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
  notes?: string | null
}

interface ContractDialogProps {
  contract?: Contract
  clients: Client[]
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  subscriptionPlan?: string
  currentCount?: number
}

export function ContractDialog({ contract, clients, trigger, open, onOpenChange, subscriptionPlan, currentCount }: ContractDialogProps) {
  const t = useTranslations('Contracts')
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const isEditing = !!contract
  const isFreePlan = subscriptionPlan === 'free' || !subscriptionPlan
  const limitReached = isFreePlan && (currentCount || 0) >= 5 && !isEditing

  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: contract?.name || '',
      client_id: contract?.client_id || '',
      start_date: (contract?.start_date ? new Date(contract.start_date) : undefined) as unknown as Date,
      end_date: (contract?.end_date ? new Date(contract.end_date) : undefined) as unknown as Date,
      renewal_type: contract?.renewal_type || 'auto-renew',
      value_amount: contract?.value_amount || 0,
      value_period: contract?.value_period || 'monthly',
      renewal_probability: contract?.renewal_probability || 'medium',
      notes: contract?.notes || '',
    },
  })

  const { toast } = useToast()
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('client_id', values.client_id)
      formData.append('start_date', values.start_date.toISOString())
      formData.append('end_date', values.end_date.toISOString())
      formData.append('renewal_type', values.renewal_type)
      formData.append('value_amount', values.value_amount.toString())
      formData.append('value_period', values.value_period)
      formData.append('renewal_probability', values.renewal_probability)
      formData.append('notes', values.notes || '')
      
      if (contract) {
          formData.append('status', contract.status)
      }

      const result = contract
        ? await updateContractAction(contract.id, formData)
        : await createContractAction(formData)

      if ('error' in result && result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: contract ? "Contract updated successfully" : "Contract created successfully",
        })
        setDialogOpen(false)
        onOpenChange?.(false)
        form.reset()
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setDialogOpen(newOpen)
    onOpenChange?.(newOpen)
    if (!newOpen) {
        form.reset()
    }
  }

  return (
    <Dialog open={open ?? dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button disabled={limitReached}>
            <Plus className="mr-2 h-4 w-4" /> {t('addContract')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editContract') : t('addContract')}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('editDescription')
              : t('addDescription')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Website Maintenance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.client')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.selectClient')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>{t('form.startDate')}</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>{t('form.endDate')}</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="value_amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('form.valueAmount')}</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="1000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="value_period"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('form.valuePeriod')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="renewal_type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('form.renewalType')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="auto-renew">Auto-renew</SelectItem>
                                <SelectItem value="manual">Manual</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="renewal_probability"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('form.renewalProbability')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select probability" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('form.notes')}</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('form.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
