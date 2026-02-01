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
    <section id="faq" className="py-20 px-4 bg-muted/50">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">{t('title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
        
        <FAQList items={items} />
      </div>
    </section>
  )
}
