import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params?.locale || 'en'
  const canonicalPath = `/${locale}/register`
  const title = 'Kayıt Ol'
  const description = 'Crewset’e katılın, sözleşme yenilemelerinizi ve tekrarlayan gelirinizi güvenceye alın.'
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
