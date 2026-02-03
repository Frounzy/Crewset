import type { Metadata } from 'next'
import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'
import { PortfolioSection } from '@/components/landing/portfolio-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { MobileAppSection } from '@/components/landing/mobile-app-section'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crewset.app'
  const locale = params?.locale || 'en'
  const canonicalPath = `/${locale}`
  const title = 'Crewset – Freelancer ve Ajanslar için Yenileme ve Gelir Koruması'
  const description = 'Sözleşme yenilemelerini takip edin, riske giren geliri görün ve ilişkileri ölçekleyin. Crewset ile tekrarlayan geliriniz güvende.'
  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'website',
      url: canonicalPath,
      title,
      description,
      siteName: 'Crewset',
      locale,
      images: ['/favicon.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/favicon.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userProp = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle()
    
    userProp = {
      name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
      email: user.email,
      image: profile?.avatar_url || user.user_metadata?.avatar_url
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={userProp} />
      <main className="flex-1">
        <Hero />
        <PortfolioSection />
        <HowItWorksSection />
        <Features />
        <MobileAppSection />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
