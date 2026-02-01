import { getTranslations } from 'next-intl/server';
import { PrivacyTR, PrivacyEN } from '@/components/legal/legal-contents';

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Legal.Privacy');
  
  return (
     <div className="container mx-auto py-12 px-4 max-w-4xl">
       <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
       <div className="prose dark:prose-invert max-w-none">
          {locale === 'tr' ? <PrivacyTR /> : <PrivacyEN />}
       </div>
     </div>
  )
}
