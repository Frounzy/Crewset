import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params?.locale || 'en'
  const canonicalPath = `/${locale}/login`
  const { getTranslations } = await import('next-intl/server')
  const t = await getTranslations('SEO.Login')
  const title = t('title')
  const description = t('description')
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    robots: { index: false, follow: true },
    openGraph: { type: 'website', url: canonicalPath, title, description, siteName: 'Crewset', locale },
    twitter: { card: 'summary', title, description },
  }
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
