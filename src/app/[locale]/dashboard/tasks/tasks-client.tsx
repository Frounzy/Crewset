 'use client'
 
 import { useMemo, useState, useTransition } from 'react'
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
 import { Button } from '@/components/ui/button'
 import { Input } from '@/components/ui/input'
 import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
 import Link from 'next/link'
import { updateTaskStatusAction } from './actions'
import { TaskDialog } from './task-dialog'
 import { format } from 'date-fns'
 import { CheckCircle2, Clock, User } from 'lucide-react'
 
 interface Task {
   id: string
   title: string
   description?: string | null
   due_date: string
   status: 'open' | 'completed'
   assignee_id?: string | null
   assignee?: { full_name: string | null; email: string }
   contract?: { name: string | null }
 }
 
export function TasksClient({ tasks, currentUserId, members = [], contracts = [] }: { tasks: Task[]; currentUserId: string; members?: any[]; contracts?: any[] }) {
   const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'completed'>('all')
   const [query, setQuery] = useState('')
   const [isPending, startTransition] = useTransition()
 
   const filtered = useMemo(() => {
     return tasks
       .filter((t) => (statusFilter === 'all' ? true : t.status === statusFilter))
       .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
       .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
   }, [tasks, statusFilter, query])
 
   const assignedToMe = useMemo(() => filtered.filter((t) => t.assignee_id === currentUserId), [filtered, currentUserId])
   const upcoming = useMemo(() => filtered.filter((t) => t.status === 'open'), [filtered])
 
   const toggleComplete = (taskId: string, nowCompleted: boolean) => {
     startTransition(async () => {
       await updateTaskStatusAction(taskId, nowCompleted ? 'completed' : 'open')
     })
   }
 
   return (
     <div className="flex-1 space-y-6">
       <div className="flex items-center justify-between">
         <h2 className="text-3xl font-bold tracking-tight">Görevler</h2>
        <TaskDialog members={members} contracts={contracts} />
       </div>
 
       <div className="grid gap-4 md:grid-cols-2">
         <Card>
           <CardHeader>
             <CardTitle>Bana Atanan Görevler</CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
             {assignedToMe.slice(0, 10).map((t) => (
               <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg border hover:border-primary/40 transition-colors">
                 <div className="size-8 flex items-center justify-center rounded-full bg-muted">
                   <User className="w-4 h-4" />
                 </div>
                 <div className="flex-1">
                   <Link href={`/dashboard/tasks/${t.id}`} className="text-sm font-medium hover:underline">
                     {t.title}
                   </Link>
                   <div className="text-xs text-muted-foreground">
                     {t.contract?.name ? `${t.contract?.name} • ` : ''}{format(new Date(t.due_date), 'dd MMM yyyy')}
                   </div>
                 </div>
                 <Button
                   size="sm"
                   variant={t.status === 'completed' ? 'secondary' : 'default'}
                   onClick={() => toggleComplete(t.id, t.status !== 'completed')}
                   disabled={isPending}
                 >
                   <CheckCircle2 className="w-4 h-4 mr-2" />
                   {t.status === 'completed' ? 'Yeniden Aç' : 'Tamamla'}
                 </Button>
               </div>
             ))}
             {!assignedToMe.length && <div className="text-sm text-muted-foreground">Size atanmış görev yok.</div>}
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader>
             <CardTitle>Yaklaşan Görevler</CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
             {upcoming.slice(0, 10).map((t) => (
               <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg border hover:border-primary/40 transition-colors">
                 <div className="size-8 flex items-center justify-center rounded-full bg-muted">
                   <Clock className="w-4 h-4" />
                 </div>
                 <div className="flex-1">
                   <Link href={`/dashboard/tasks/${t.id}`} className="text-sm font-medium hover:underline">
                     {t.title}
                   </Link>
                   <div className="text-xs text-muted-foreground">
                     {t.assignee?.full_name || t.assignee?.email} • {format(new Date(t.due_date), 'dd MMM yyyy')}
                   </div>
                 </div>
                 <Button
                   size="sm"
                   variant={t.status === 'completed' ? 'secondary' : 'default'}
                   onClick={() => toggleComplete(t.id, t.status !== 'completed')}
                   disabled={isPending}
                 >
                   <CheckCircle2 className="w-4 h-4 mr-2" />
                   {t.status === 'completed' ? 'Yeniden Aç' : 'Tamamla'}
                 </Button>
               </div>
             ))}
             {!upcoming.length && <div className="text-sm text-muted-foreground">Yaklaşan görev yok.</div>}
           </CardContent>
         </Card>
       </div>
 
       <div className="grid gap-4">
         <Card>
           <CardHeader className="flex items-center justify-between">
             <CardTitle>Tüm Görevler</CardTitle>
             <div className="flex items-center gap-2">
               <Input placeholder="Ara..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-48" />
               <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                 <SelectTrigger className="w-40">
                   <SelectValue placeholder="Durum" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Tümü</SelectItem>
                   <SelectItem value="open">Açık</SelectItem>
                   <SelectItem value="completed">Tamamlandı</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </CardHeader>
           <CardContent className="space-y-2">
             {filtered.map((t) => (
               <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg border hover:border-primary/40 transition-colors">
                 <div className="flex-1">
                   <Link href={`/dashboard/tasks/${t.id}`} className="text-sm font-medium hover:underline">
                     {t.title}
                   </Link>
                   <div className="text-xs text-muted-foreground">
                     {t.assignee?.full_name || t.assignee?.email || 'Atanmamış'} • {format(new Date(t.due_date), 'dd MMM yyyy')}
                   </div>
                 </div>
                 <Button
                   size="sm"
                   variant={t.status === 'completed' ? 'secondary' : 'default'}
                   onClick={() => toggleComplete(t.id, t.status !== 'completed')}
                   disabled={isPending}
                 >
                   <CheckCircle2 className="w-4 h-4 mr-2" />
                   {t.status === 'completed' ? 'Yeniden Aç' : 'Tamamla'}
                 </Button>
               </div>
             ))}
             {!filtered.length && <div className="text-sm text-muted-foreground">Görev bulunamadı.</div>}
           </CardContent>
         </Card>
       </div>
     </div>
   )
 }
 
