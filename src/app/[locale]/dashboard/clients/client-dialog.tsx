'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Plus, Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
import { createClientAction, updateClientAction } from './actions'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^[+()0-9\s-]{7,20}$/.test(val), {
      message: 'Invalid phone number',
    }),
  company: z.string().optional(),
  notes: z.string().optional(),
})

interface ClientDialogProps {
  client?: any // Type this properly later
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  subscriptionPlan?: string
  currentCount?: number
}

export function ClientDialog({ client, trigger, open, onOpenChange, subscriptionPlan, currentCount }: ClientDialogProps) {
  const t = useTranslations('Clients')
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const isEditing = !!client
  const isFreePlan = subscriptionPlan === 'free' || !subscriptionPlan
  const limitReached = isFreePlan && (currentCount || 0) >= 3 && !isEditing

  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      company: client?.company || '',
      notes: client?.notes || '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value || '')
      })

      const result = isEditing
        ? await updateClientAction(client.id, formData)
        : await createClientAction(formData)

      if (result.error) {
        // toast.error(result.error)
        console.error(result.error)
      } else {
        // toast.success(result.success)
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
            {isEditing ? (
              <>
                <Pencil className="mr-2 h-4 w-4" /> {t('editClient')}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> {t('addClient')}
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('editClient') : t('addClient')}</DialogTitle>
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
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.email')}</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.phone') || 'Telefon'}</FormLabel>
                  <FormControl>
                    <Input placeholder="+90 555 555 55 55" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.company')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
