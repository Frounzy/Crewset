import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server';
import { PrivacyTR, PrivacyEN } from '@/components/legal/legal-contents';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crewset.app'
  const locale = params?.locale || 'en'
  const canonicalPath = `/${locale}/privacy`
  const title = 'Gizlilik Politikası | Crewset'
  const description = 'Crewset gizlilik politikası ve kişisel verilerin işlenmesine ilişkin bilgiler.'
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    robots: { index: true, follow: true },
    openGraph: { type: 'article', url: canonicalPath, title, description, siteName: 'Crewset', locale },
    twitter: { card: 'summary', title, description },
  }
}

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
