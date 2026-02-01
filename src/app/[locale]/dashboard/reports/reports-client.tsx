'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'

interface Contract {
  status: string
  end_date: string
  value_amount: number
}

interface ReportsClientProps {
  contracts: Contract[]
}

export function ReportsClient({ contracts }: ReportsClientProps) {
  const t = useTranslations('Reports')

  // Process data for Revenue by Month (Expiration)
  // We only care about active contracts expiring in the future
  const revenueByMonthMap = new Map<string, number>()
  
  contracts.forEach(contract => {
    if (contract.status === 'active' && contract.end_date) {
      const date = parseISO(contract.end_date)
      const key = format(date, 'yyyy-MM') // Sortable key
      const amount = Number(contract.value_amount) || 0
      revenueByMonthMap.set(key, (revenueByMonthMap.get(key) || 0) + amount)
    }
  })

  const revenueByMonth = Array.from(revenueByMonthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, amount]) => {
      const [year, month] = key.split('-')
      // Create date object correctly handling local time zone issues is tricky, 
      // but simpler to just parse the year/month
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return {
        month: format(date, 'MMM yyyy'),
        amount
      }
    })
    // Limit to next 12 months or so if needed, but let's show all for now

  // Process data for Status Distribution
  const statusMap = new Map<string, number>()
  contracts.forEach(contract => {
    const status = contract.status
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })

  const statusDistribution = Array.from(statusMap.entries()).map(([name, value]) => ({
    name,
    value
  }))

  const COLORS = ['#0ea5e9', '#22c55e', '#ef4444', '#f59e0b'] // Sky, Green, Red, Amber
  // Map status to specific colors if possible
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#0ea5e9' // Sky
      case 'renewed': return '#22c55e' // Green
      case 'lost': return '#ef4444' // Red
      case 'expired': return '#f59e0b' // Amber
      default: return '#8884d8'
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>{t('revenueByMonth')}</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMonth}>
                <XAxis 
                    dataKey="month" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                />
                <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px' }}
                    formatter={(value: any) => [`$${value}`, t('amount')]}
                />
                <Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>{t('contractStatus')}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value, t('count')]} />
                    <Legend formatter={(value) => t(value)} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
