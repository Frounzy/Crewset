import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
 
export async function generateMetadata({ params }: { params: { locale: string, token: string } }): Promise<Metadata> {
  const locale = params?.locale || 'tr'
  const t = await getTranslations('SEO.Feedback')
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: `/${locale}/feedback/${params?.token || ''}` },
    robots: { index: false, follow: true },
  }
}
 
export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children
}
