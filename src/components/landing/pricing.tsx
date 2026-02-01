import { Link } from '@/navigation'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PLANS } from '@/config/subscriptions'
import { getTranslations } from 'next-intl/server'

export async function Pricing() {
  const t = await getTranslations('Pricing')

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">{t('title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={plan.slug === 'pro' ? 'border-primary relative shadow-lg' : ''}>
              {plan.slug === 'pro' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {t('mostPopular')}
                </div>
              )}
              <CardHeader>
                <CardTitle>{t(`plans.${plan.slug}.name`)}</CardTitle>
                <CardDescription>{t(`plans.${plan.slug}.description`)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">
                  {plan.price}
                  <span className="text-lg font-normal text-muted-foreground">{t('perMonth')}</span>
                </div>
                <ul className="space-y-3">
                  {/* We are assuming the features in PLANS config match the index in translations */}
                  {plan.features.map((feature, index) => (
                    <li key={feature} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {t(`plans.${plan.slug}.features.${index}`)}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/register" className="w-full">
                  <Button className="w-full" variant={plan.slug === 'pro' ? 'default' : 'outline'}>
                    {t('getStarted')}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
