import { UserPlus, FileText, BellRing } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function HowItWorksSection() {
  const t = await getTranslations('Landing.HowItWorks')

  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 text-center space-y-16">
        <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            {t('title')}
            </h2>
            <p className="text-xl text-muted-foreground">
            {t('subtitle')}
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-muted -z-10" />

            <div className="relative bg-background pt-4 px-4">
                <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 border-4 border-background">
                    <UserPlus className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. {t('step1Title')}</h3>
                <p className="text-muted-foreground">
                    {t('step1Desc')}
                </p>
            </div>

            <div className="relative bg-background pt-4 px-4">
                <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 border-4 border-background">
                    <FileText className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. {t('step2Title')}</h3>
                <p className="text-muted-foreground">
                    {t('step2Desc')}
                </p>
            </div>

            <div className="relative bg-background pt-4 px-4">
                <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 border-4 border-background">
                    <BellRing className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. {t('step3Title')}</h3>
                <p className="text-muted-foreground">
                    {t('step3Desc')}
                </p>
            </div>
        </div>

        <div className="inline-block rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
            {t('note')}
        </div>
      </div>
    </section>
  )
}
