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
import { Link as LinkIcon, CheckCircle2, Clock } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

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
  const t = await getTranslations('Landing.ApprovalLink')

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
        <section className="relative px-4 py-12">
          <div className="max-w-5xl mx-auto rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 shadow-xl p-6 md:p-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">{t('title')}</h3>
              <p className="text-sm md:text-base text-muted-foreground">{t('description')}</p>
            </div>
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60 border">
                <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{t('items.link.title')}</div>
                  <div className="text-muted-foreground">{t('items.link.desc')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60 border">
                <div className="h-9 w-9 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{t('items.approve.title')}</div>
                  <div className="text-muted-foreground">{t('items.approve.desc')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60 border">
                <div className="h-9 w-9 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{t('items.record.title')}</div>
                  <div className="text-muted-foreground">{t('items.record.desc')}</div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center text-xs md:text-sm text-muted-foreground">
              {t('footnote')}
            </div>
          </div>
        </section>
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
