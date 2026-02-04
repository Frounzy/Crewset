 'use client'
 
 import { useEffect, useMemo, useState } from 'react'
 import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
 } from 'recharts'
 import { format, parseISO } from 'date-fns'
 import {
   Select,
   SelectTrigger,
   SelectValue,
   SelectContent,
   SelectItem,
 } from '@/components/ui/select'
 import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
 
 type ValuePeriod = 'monthly' | 'yearly'
 
 interface Contract {
   id: string
   name: string
   status: string
   end_date: string | null
   value_amount: number
   value_period: ValuePeriod
   created_at?: string | null
   renewed_at?: string | null
 }
 
 interface OverviewClientProps {
   contracts: Contract[]
 }
 
 const METRIC_LABELS: Record<string, string> = {
   totalRevenue: 'Toplam Gelir',
   newContracts: 'Yeni Sözleşmeler',
   renewedContracts: 'Yenilenen Sözleşmeler',
   revenueAtRisk: 'Risk Altındaki Gelir',
 }
 
 const formatCurrency = (amount: number) =>
   new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
     amount || 0
   )
 
 type ChartDatum = {
   label: string
   value: number
   formattedValue: string
   contractCount: number
 }
 
 export function OverviewClient({ contracts }: OverviewClientProps) {
   const [metric, setMetric] = useState<string>('totalRevenue')
   const [timeRange, setTimeRange] = useState<'monthly' | 'yearly'>('monthly')
 
   const data = useMemo<ChartDatum[]>(() => {
     return processChartData(contracts || [], metric, timeRange)
   }, [contracts, metric, timeRange])
 
   return (
     <Card className="w-full bg-background border-border">
       <CardHeader>
         <CardTitle>Overview</CardTitle>
         <div className="mt-3 flex flex-col sm:flex-row gap-3">
           <div className="flex items-center gap-2">
             <span className="text-sm text-muted-foreground">Metrik</span>
             <Select value={metric} onValueChange={(v) => v && setMetric(v)}>
               <SelectTrigger className="w-[220px]">
                 <SelectValue placeholder="Metrik seç" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="totalRevenue">{METRIC_LABELS.totalRevenue}</SelectItem>
                 <SelectItem value="newContracts">{METRIC_LABELS.newContracts}</SelectItem>
                 <SelectItem value="renewedContracts">
                   {METRIC_LABELS.renewedContracts}
                 </SelectItem>
                 <SelectItem value="revenueAtRisk">{METRIC_LABELS.revenueAtRisk}</SelectItem>
               </SelectContent>
             </Select>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-sm text-muted-foreground">Zaman</span>
             <Select
               value={timeRange}
               onValueChange={(v) => (v === 'monthly' || v === 'yearly') && setTimeRange(v)}
             >
               <SelectTrigger className="w-[160px]">
                 <SelectValue placeholder="Zaman aralığı" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="monthly">Aylık</SelectItem>
                 <SelectItem value="yearly">Yıllık</SelectItem>
               </SelectContent>
             </Select>
           </div>
         </div>
       </CardHeader>
       <CardContent>
         {data.length ? (
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart
                 data={data}
                 margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
               >
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                 <XAxis dataKey="label" stroke="rgba(128,128,128,0.6)" />
                 <YAxis stroke="rgba(128,128,128,0.6)" />
                 <Tooltip
                   cursor={{ stroke: 'rgba(128,128,128,0.3)' }}
                   contentStyle={{
                     borderRadius: 8,
                     backgroundColor: 'var(--background)',
                     border: '1px solid var(--border)',
                   }}
                   formatter={(value: any) => [
                     metric === 'totalRevenue' || metric === 'revenueAtRisk'
                       ? formatCurrency(Number(value))
                       : Number(value),
                     METRIC_LABELS[metric],
                   ]}
                   labelFormatter={(label) => label}
                 />
                 <Line
                   type="monotone"
                   dataKey="value"
                   stroke="#0ea5e9"
                   strokeWidth={2}
                   dot={{ r: 3, strokeWidth: 1, fill: '#0ea5e9' }}
                   activeDot={{ r: 5, fill: '#0ea5e9' }}
                 />
               </LineChart>
             </ResponsiveContainer>
           </div>
         ) : (
           <div className="h-[300px] flex items-center justify-center text-muted-foreground">
             No data
           </div>
         )}
       </CardContent>
     </Card>
   )
 }
 
 function normalizeMonthlyValue(amount: number, period: ValuePeriod) {
   const val = Number(amount) || 0
   return period === 'monthly' ? val : val / 12
 }
 
 function bucketKey(date: Date, range: 'monthly' | 'yearly') {
   return range === 'monthly' ? format(date, 'yyyy-MM') : format(date, 'yyyy')
 }
 
 function labelFromKey(key: string, range: 'monthly' | 'yearly') {
   if (range === 'monthly') {
     const [y, m] = key.split('-')
     const d = new Date(parseInt(y), parseInt(m) - 1)
     return format(d, 'MMM yyyy')
   }
   return key
 }
 
 function processChartData(
   contracts: Contract[],
   metric: string,
   timeRange: 'monthly' | 'yearly'
 ): ChartDatum[] {
   const buckets = new Map<
     string,
     { value: number; contractCount: number; dateKey: string }
   >()
 
   for (const c of contracts) {
     if (metric === 'newContracts') {
       if (!c.created_at) continue
       const d = safeParseDate(c.created_at)
       if (!d) continue
       const key = bucketKey(d, timeRange)
       const b = buckets.get(key) || { value: 0, contractCount: 0, dateKey: key }
       b.value += 1
       b.contractCount += 1
       buckets.set(key, b)
     } else if (metric === 'renewedContracts') {
       const source = c.renewed_at || null
       if (!source) continue
       const d = safeParseDate(source)
       if (!d) continue
       const key = bucketKey(d, timeRange)
       const b = buckets.get(key) || { value: 0, contractCount: 0, dateKey: key }
       b.value += 1
       b.contractCount += 1
       buckets.set(key, b)
     } else if (metric === 'revenueAtRisk') {
       if (c.status !== 'active' || !c.end_date) continue
       const end = safeParseDate(c.end_date)
       if (!end) continue
       // Bucket by end date (risk occurs when contract expires)
       const key = bucketKey(end, timeRange)
       const b = buckets.get(key) || { value: 0, contractCount: 0, dateKey: key }
       b.value += normalizeMonthlyValue(c.value_amount, c.value_period)
       b.contractCount += 1
       buckets.set(key, b)
     } else {
       // totalRevenue (approximate by creation date)
       const source = c.created_at || null
       if (!source) continue
       const d = safeParseDate(source)
       if (!d) continue
       const key = bucketKey(d, timeRange)
       const b = buckets.get(key) || { value: 0, contractCount: 0, dateKey: key }
       b.value += normalizeMonthlyValue(c.value_amount, c.value_period)
       b.contractCount += 1
       buckets.set(key, b)
     }
   }
 
   const entries = Array.from(buckets.values()).sort((a, b) =>
     a.dateKey.localeCompare(b.dateKey)
   )
 
   return entries.map((e) => ({
     label: labelFromKey(e.dateKey, timeRange),
     value: Number(e.value.toFixed(2)),
     formattedValue:
       metric === 'totalRevenue' || metric === 'revenueAtRisk'
         ? formatCurrency(e.value)
         : String(e.value),
     contractCount: e.contractCount,
   }))
 }
 
 function safeParseDate(input?: string | null): Date | null {
   if (!input) return null
   try {
     return parseISO(input)
   } catch {
     return null
   }
 }
 
