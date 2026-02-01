import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function PortfolioSection() {
  const t = await getTranslations('Landing.Portfolio')

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              {t('title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('description')}
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-lg">{t('feature1')}</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-lg">{t('feature2')}</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-lg">{t('feature3')}</span>
              </li>
            </ul>

            <div className="space-y-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-lg w-full md:w-auto">
                  {t('cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground font-medium">
                {t('subNote')}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-12 -right-12 -z-10 h-[300px] w-[300px] rounded-full bg-pink-500/20 blur-[100px]" />
            <div className="rounded-xl border bg-background shadow-2xl overflow-hidden aspect-[4/3] relative group">
                {/* Mockup for Portfolio */}
                <div className="absolute inset-0 bg-muted/10 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted-foreground/20 animate-pulse"></div>
                        <div className="space-y-2">
                            <div className="w-32 h-4 bg-muted-foreground/20 rounded animate-pulse"></div>
                            <div className="w-24 h-3 bg-muted-foreground/10 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="space-y-3 mt-4">
                        <div className="w-full h-24 bg-muted-foreground/10 rounded animate-pulse"></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="h-32 bg-muted-foreground/10 rounded animate-pulse"></div>
                            <div className="h-32 bg-muted-foreground/10 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
