import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server';
import { PrivacyTR, PrivacyEN } from '@/components/legal/legal-contents';
import { Card, CardContent } from '@/components/ui/card'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crewset.app'
  const locale = params?.locale || 'en'
  const canonicalPath = `/${locale}/privacy`
  const title = 'Gizlilik Politikası'
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
     <section className="relative py-20 bg-gradient-to-b from-primary/10 via-background to-background">
       <div className="absolute -top-24 -left-24 h-[360px] w-[360px] rounded-full bg-primary/15 blur-[120px]" />
       <div className="absolute -bottom-24 -right-24 h-[360px] w-[360px] rounded-full bg-purple-500/15 blur-[120px]" />
       <div className="max-w-4xl mx-auto px-4 space-y-8">
         <div className="text-center space-y-3">
           <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
           <p className="text-muted-foreground">Verilerinizi şeffaf ve güvenli şekilde işliyoruz.</p>
         </div>
         <Card>
           <CardContent className="p-8">
             <div className="prose dark:prose-invert max-w-none">
               {locale === 'tr' ? <PrivacyTR /> : <PrivacyEN />}
             </div>
           </CardContent>
         </Card>
       </div>
     </section>
  )
}
