import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params?.locale || 'en'
  const canonicalPath = `/${locale}/register`
  const { getTranslations } = await import('next-intl/server')
  const t = await getTranslations('SEO.Register')
  const title = t('title')
  const description = t('description')
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    robots: { index: true, follow: true },
    openGraph: { type: 'website', url: canonicalPath, title, description, siteName: 'Crewset', locale },
    twitter: { card: 'summary', title, description },
  }
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
