import { Shield, Bell, CreditCard, Zap } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function TrustSection() {
  const t = await getTranslations('Landing.Trust')

  const items = [
    { icon: Shield, text: t('card1') },
    { icon: Bell, text: t('card2') },
    { icon: CreditCard, text: t('card3') },
    { icon: Zap, text: t('card4') },
  ]

  return (
    <section className="py-16 border-y bg-muted/20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight">
                {t('title')}
            </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 rounded-lg bg-background border shadow-sm">
                    <div className="p-2 bg-primary/10 rounded-full mb-3">
                        <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{item.text}</span>
                </div>
            ))}
        </div>
      </div>
    </section>
  )
}
