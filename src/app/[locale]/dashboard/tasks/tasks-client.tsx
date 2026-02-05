'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
 import { Button } from '@/components/ui/button'
 import { Input } from '@/components/ui/input'
 import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
 import { Link } from '@/navigation'
import { updateTaskStatusAction } from './actions'
import { TaskDialog } from './task-dialog'
 import { format } from 'date-fns'
import { CheckCircle2, Clock, User } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
 
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
 
export function TasksClient({ tasks, currentUserId, members = [], contracts = [], orgLogos = {} }: { tasks: Task[]; currentUserId: string; members?: any[]; contracts?: any[]; orgLogos?: Record<string, string | null> }) {
   const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'completed'>('all')
   const [query, setQuery] = useState('')
   const [isPending, startTransition] = useTransition()
  const [items, setItems] = useState<Task[]>(tasks || [])
  const { toast } = useToast()
  useEffect(() => {
    const run = async () => {
      if (!tasks?.length) {
        try {
          const res = await fetch('/api/tasks', { method: 'GET' })
          const json = await res.json()
          if (Array.isArray(json?.tasks)) {
            setItems(json.tasks)
          }
        } catch {}
      }
    }
    run()
  }, [tasks.length])
 
  const membersMap = useMemo(() => {
    const map: Record<string, { full_name?: string | null; email?: string }> = {}
    ;(members || []).forEach((m: any) => {
      if (m?.user_id && m?.profile) {
        map[m.user_id] = { full_name: m.profile.full_name, email: m.profile.email }
      }
    })
    return map
  }, [members])

  const resolveAssignee = (t: Task) => {
    return (
      t.assignee?.full_name ||
      t.assignee?.email ||
      (t.assignee_id ? (membersMap[t.assignee_id]?.full_name || membersMap[t.assignee_id]?.email) : undefined)
    )
  }

  const filtered = useMemo(() => {
    return items
       .filter((t) => (statusFilter === 'all' ? true : t.status === statusFilter))
       .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
       .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  }, [items, statusFilter, query])
 
   const assignedToMe = useMemo(() => filtered.filter((t) => t.assignee_id === currentUserId), [filtered, currentUserId])
   const upcoming = useMemo(() => filtered.filter((t) => t.status === 'open'), [filtered])
 
   const toggleComplete = (taskId: string, nowCompleted: boolean) => {
     startTransition(async () => {
       await updateTaskStatusAction(taskId, nowCompleted ? 'completed' : 'open')
      setItems((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: nowCompleted ? 'completed' : 'open' } as Task : t))
      )
     })
   }
  const resetAll = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/tasks', { method: 'DELETE' })
        const json = await res.json()
        if (json?.success) {
          setItems([])
          toast({ title: 'Başarılı', description: 'Tüm görevleriniz silindi.' })
        } else {
          toast({ title: 'Hata', description: json?.error || 'Görevler silinemedi.', variant: 'destructive' })
        }
      } catch (e: any) {
        toast({ title: 'Hata', description: e?.message || 'Bir hata oluştu', variant: 'destructive' })
      }
    })
  }
 
   return (
     <div className="flex-1 space-y-6">
       <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Görevler</h2>
        <div className="flex items-center gap-2">
          <TaskDialog members={members} contracts={contracts} onCreated={(t) => setItems((prev) => [t as Task, ...prev])} />
          <Button variant="destructive" onClick={resetAll} disabled={isPending}>Görevleri Sıfırla</Button>
        </div>
       </div>
 
       <div className="grid gap-4 md:grid-cols-2">
         <Card>
           <CardHeader>
             <CardTitle>Bana Atanan Görevler</CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
            {assignedToMe.slice(0, 10).map((t) => (
               <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg border hover:border-primary/40 transition-colors">
                {orgLogos[(t as any).organization_id] ? (
                  <div className="relative h-8 w-8 rounded-full overflow-hidden ring-1 ring-border">
                    <Image src={orgLogos[(t as any).organization_id] as string} alt="Org" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="size-8 flex items-center justify-center rounded-full bg-muted">
                    <User className="w-4 h-4" />
                  </div>
                )}
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
                {orgLogos[(t as any).organization_id] ? (
                  <div className="relative h-8 w-8 rounded-full overflow-hidden ring-1 ring-border">
                    <Image src={orgLogos[(t as any).organization_id] as string} alt="Org" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="size-8 flex items-center justify-center rounded-full bg-muted">
                    <Clock className="w-4 h-4" />
                  </div>
                )}
                 <div className="flex-1">
                   <Link href={`/dashboard/tasks/${t.id}`} className="text-sm font-medium hover:underline">
                     {t.title}
                   </Link>
                   <div className="text-xs text-muted-foreground">
                    {resolveAssignee(t)} • {format(new Date(t.due_date), 'dd MMM yyyy')}
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
                 {orgLogos[(t as any).organization_id] && (
                   <div className="relative h-6 w-6 rounded-full overflow-hidden ring-1 ring-border">
                     <Image src={orgLogos[(t as any).organization_id] as string} alt="Org" fill className="object-cover" />
                   </div>
                 )}
                 <div className="flex-1">
                   <Link href={`/dashboard/tasks/${t.id}`} className="text-sm font-medium hover:underline">
                     {t.title}
                   </Link>
                   <div className="text-xs text-muted-foreground">
                    {resolveAssignee(t) || 'Atanmamış'} • {format(new Date(t.due_date), 'dd MMM yyyy')}
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
 
