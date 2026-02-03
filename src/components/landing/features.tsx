import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Bell, BarChart3, Shield, Users, Calendar, Clock } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function Features() {
  const t = await getTranslations('Features')

  const accents: Record<string, string> = {
    smartReminders: 'from-fuchsia-500/25 to-purple-500/25',
    revenueProtection: 'from-indigo-500/25 to-sky-500/25',
    clientManagement: 'from-violet-500/25 to-purple-500/25',
    contractTracking: 'from-sky-500/25 to-cyan-500/25',
    performanceReports: 'from-emerald-500/25 to-teal-500/25',
    timeSaving: 'from-orange-500/25 to-rose-500/25',
  }

  const features = [
    {
      key: 'smartReminders',
      icon: Bell,
    },
    {
      key: 'revenueProtection',
      icon: Shield,
    },
    {
      key: 'clientManagement',
      icon: Users,
    },
    {
      key: 'contractTracking',
      icon: Calendar,
    },
    {
      key: 'performanceReports',
      icon: BarChart3,
    },
    {
      key: 'timeSaving',
      icon: Clock,
    },
  ]

  return (
    <section id="features" className="relative py-24 px-4 bg-gradient-to-b from-background via-background to-primary/5 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-[360px] w-[360px] rounded-full bg-primary/15 blur-[120px]" />
      <div className="absolute -bottom-24 -right-24 h-[360px] w-[360px] rounded-full bg-purple-500/15 blur-[120px]" />
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {t('title')}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.key} className="group relative rounded-2xl bg-background/50 p-[1px] overflow-hidden transition-all hover:shadow-2xl">
              <Card className="rounded-2xl bg-background/70 backdrop-blur-sm border border-border hover:border-primary/40 hover:bg-background/80 hover:shadow-xl transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl border border-border bg-primary/10 flex items-center justify-center shadow-inner transition group-hover:ring-2 group-hover:ring-primary/30">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="tracking-tight">{t(`items.${feature.key}.title`)}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {t(`items.${feature.key}.description`)}
                  </CardDescription>
                </CardContent>
              </Card>
              <div className={`pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition bg-gradient-to-br ${accents[feature.key]}`} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
