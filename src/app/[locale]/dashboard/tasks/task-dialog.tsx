 'use client'
 
 import { useState, useTransition } from 'react'
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
 import { useForm } from 'react-hook-form'
 import { zodResolver } from '@hookform/resolvers/zod'
 import * as z from 'zod'
 import { Loader2, Plus } from 'lucide-react'
 import { createTaskAction } from './actions'
 import { useToast } from '@/hooks/use-toast'
 import { useRouter } from 'next/navigation'
 
 const formSchema = z.object({
   title: z.string().min(1),
   description: z.string().optional(),
   contract_id: z.string().uuid().optional(),
   assignee_id: z.string().uuid().optional(),
   due_date: z.date(),
 })
 
export function TaskDialog({ members, contracts, onCreated, triggerLabel }: { members: any[]; contracts: any[]; onCreated?: (task: any) => void; triggerLabel?: string }) {
   const [isPending, startTransition] = useTransition()
   const [dialogOpen, setDialogOpen] = useState(false)
   const { toast } = useToast()
  const router = useRouter()
 
   const form = useForm<z.infer<typeof formSchema>>({
     resolver: zodResolver(formSchema) as any,
     defaultValues: {
       title: '',
       description: '',
       contract_id: undefined,
       assignee_id: undefined,
       due_date: undefined as unknown as Date,
     },
   })
 
   const onSubmit = (values: z.infer<typeof formSchema>) => {
     startTransition(async () => {
       const fd = new FormData()
       fd.append('title', values.title)
       if (values.description) fd.append('description', values.description)
       if (values.contract_id) fd.append('contract_id', values.contract_id)
       if (values.assignee_id) fd.append('assignee_id', values.assignee_id)
       fd.append('due_date', values.due_date.toISOString().split('T')[0])
 
       const res = await createTaskAction(fd)
       if ((res as any)?.error) {
         toast({ title: 'Hata', description: (res as any).error, variant: 'destructive' })
       } else {
         toast({ title: 'Başarılı', description: 'Görev oluşturuldu' })
         setDialogOpen(false)
         form.reset()
        router.refresh()
        if ((res as any)?.task && onCreated) {
          onCreated((res as any).task)
        }
       }
     })
   }
 
   const handleOpenChange = (open: boolean) => {
     setDialogOpen(open)
     if (!open) {
       form.reset()
     }
   }
 
   return (
     <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
       <DialogTrigger asChild>
         <Button>
          <Plus className="mr-2 h-4 w-4" /> {triggerLabel || 'Görev Oluştur'}
         </Button>
       </DialogTrigger>
       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>Görev Oluştur</DialogTitle>
           <DialogDescription>Başlık, son tarih ve isteğe bağlı alanları doldurun.</DialogDescription>
         </DialogHeader>
         <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
               control={form.control}
               name="title"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Başlık</FormLabel>
                   <FormControl>
                     <Input placeholder="Örn. Müşteri sunumu hazırlama" {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             <FormField
               control={form.control}
               name="description"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Açıklama</FormLabel>
                   <FormControl>
                     <Textarea placeholder="Detaylar..." {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             <div className="grid grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="contract_id"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Sözleşme (opsiyonel)</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Sözleşme seçin" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {contracts.map((c: any) => (
                           <SelectItem key={c.id} value={c.id}>
                             {c.name}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="assignee_id"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Atanan Kullanıcı (opsiyonel)</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Kullanıcı seçin" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {members.map((m: any) => (
                           <SelectItem key={m.user_id} value={m.user_id}>
                             {m.profile?.full_name || m.profile?.email}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
 
             <FormField
               control={form.control}
               name="due_date"
               render={({ field }) => (
                 <FormItem className="flex flex-col">
                   <FormLabel>Son Tarih</FormLabel>
                   <DatePicker date={field.value} setDate={field.onChange} />
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             <DialogFooter>
               <Button type="submit" disabled={isPending}>
                 {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Kaydet
               </Button>
             </DialogFooter>
           </form>
         </Form>
       </DialogContent>
     </Dialog>
   )
 }
 
