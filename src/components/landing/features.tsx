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
    <section id="features" className="py-20 px-4 bg-muted/50">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">{t('title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.key} className="bg-background">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{t(`items.${feature.key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t(`items.${feature.key}.description`)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
