import { getTranslations } from 'next-intl/server'
import { FAQList } from './faq-list'

export async function FAQ() {
  const t = await getTranslations('FAQ')

  const items = [
    'item1',
    'item2',
    'item3',
    'item4',
    'item5',
  ].map((key) => ({
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }))

  return (
    <section
      id="faq"
      className="py-24 px-4 bg-gradient-to-b from-primary/5 via-muted/40 to-transparent"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
        
        <FAQList items={items} />
      </div>
    </section>
  )
}
