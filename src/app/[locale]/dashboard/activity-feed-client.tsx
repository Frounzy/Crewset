 'use client'
 
 import { useMemo } from 'react'
 import Link from 'next/link'
 import { Card, CardContent } from '@/components/ui/card'
 import { formatDistanceToNow } from 'date-fns'
 import { tr, enUS } from 'date-fns/locale'
 import { useLocale } from 'next-intl'
 import { AlertTriangle, FileText, RefreshCcw, Signature } from 'lucide-react'
 
 export type ActivityEventType =
   | 'signed'
   | 'renewed'
   | 'expiring'
  | 'created'
  | 'task_created'
  | 'task_assigned'
  | 'task_completed'
 
 export interface ActivityEvent {
   id: string
   type: ActivityEventType
   contractId: string
   contractName: string
   clientName?: string | null
   at: string
 }
 
 const typeMeta: Record<ActivityEventType, { icon: React.ReactNode; label: string; color: string }> = {
   signed: { icon: <Signature className="w-4 h-4" />, label: 'Sözleşme imzalandı', color: 'text-emerald-500' },
   renewed: { icon: <RefreshCcw className="w-4 h-4" />, label: 'Sözleşme yenilendi', color: 'text-blue-500' },
   expiring: { icon: <AlertTriangle className="w-4 h-4" />, label: 'Süresi dolmak üzere', color: 'text-amber-500' },
   created: { icon: <FileText className="w-4 h-4" />, label: 'Yeni sözleşme oluşturuldu', color: 'text-primary' },
  task_created: { icon: <FileText className="w-4 h-4" />, label: 'Görev oluşturuldu', color: 'text-primary' },
  task_assigned: { icon: <Signature className="w-4 h-4" />, label: 'Görev atandı', color: 'text-indigo-500' },
  task_completed: { icon: <RefreshCcw className="w-4 h-4" />, label: 'Görev tamamlandı', color: 'text-emerald-600' },
 }
 
 export function ActivityFeedClient({ events }: { events: ActivityEvent[] }) {
   const locale = useLocale()
   const dfLocale = locale === 'tr' ? tr : enUS
 
   const items = useMemo(
     () =>
       [...events]
         .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
         .slice(0, 10),
     [events]
   )
 
   if (!items.length) {
     return (
       <div className="text-sm text-muted-foreground">Henüz hareket bulunmuyor.</div>
     )
   }
 
   return (
     <Card className="bg-background border-border">
       <CardContent className="space-y-4 pt-6">
         {items.map((ev) => {
           const meta = typeMeta[ev.type]
           const timeAgo = formatDistanceToNow(new Date(ev.at), {
             addSuffix: true,
             locale: dfLocale,
           })
 
           return (
             <Link
               key={`${ev.type}-${ev.id}-${ev.at}`}
               href={`/dashboard/contracts?contractId=${ev.contractId}`}
               className="block group"
             >
               <div className="flex items-center gap-3 p-2 rounded-lg border hover:border-primary/40 transition-colors duration-200">
                 <div className={`flex items-center justify-center rounded-full ${meta.color} bg-muted size-8`}>
                   {meta.icon}
                 </div>
                 <div className="flex-1">
                   <div className="text-sm font-medium">
                     {meta.label}: {ev.contractName}
                   </div>
                   <div className="text-xs text-muted-foreground">
                     {ev.clientName || 'Müşteri'} • {timeAgo}
                   </div>
                 </div>
               </div>
             </Link>
           )
         })}
       </CardContent>
     </Card>
   )
 }
 
