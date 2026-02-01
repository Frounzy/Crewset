import { getTranslations } from 'next-intl/server';
import { TermsTR, TermsEN } from '@/components/legal/legal-contents';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Legal.Terms');
  
  return (
     <div className="container mx-auto py-12 px-4 max-w-4xl">
       <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
       <div className="prose dark:prose-invert max-w-none">
          {locale === 'tr' ? <TermsTR /> : <TermsEN />}
       </div>
     </div>
  )
}
