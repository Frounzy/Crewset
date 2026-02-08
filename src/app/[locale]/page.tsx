import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'
import { EarlyAccessSection } from '@/components/landing/early-access'
import { FAQ } from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'
import { PortfolioSection } from '@/components/landing/portfolio-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { MobileAppSection } from '@/components/landing/mobile-app-section'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crewset.app'
  const locale = params?.locale || 'en'
  const canonicalPath = `/${locale}`
  const t = await getTranslations('SEO.Home')
  const title = t('title')
  const description = t('description')
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
        <section className="relative px-4 py-24 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/15 via-background to-background" />
          <div className="absolute -top-40 left-1/3 -z-10 h-[560px] w-[560px] rounded-full bg-primary/25 blur-[160px]" />
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-primary/40 via-primary/5 to-purple-500/30 shadow-2xl">
                <div className="rounded-3xl border bg-background/70 backdrop-blur ring-1 ring-inset ring-border dark:ring-white/10">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background opacity-70 dark:from-[#201637] dark:via-[#0F0A1F] dark:to-background" />
                    <div className="absolute -top-24 -left-24 h-[480px] w-[480px] rounded-full bg-primary/25 blur-[160px]" />
                    <div className="absolute -bottom-24 -right-24 h-[480px] w-[480px] rounded-full bg-purple-500/25 blur-[160px]" />
                    <div className="relative h-full w-full p-8 flex flex-col gap-6">
                      <div className="h-10 rounded-full bg-background/40 border border-border dark:border-white/10 ring-0 dark:ring-1 dark:ring-white/5" />
                      <div className="flex gap-6">
                        <div className="w-1/3 h-56 rounded-2xl bg-background/40 border border-border dark:border-white/10 ring-0 dark:ring-1 dark:ring-white/5" />
                        <div className="flex-1 h-56 rounded-2xl bg-background/40 border border-border dark:border-white/10 ring-0 dark:ring-1 dark:ring-white/5" />
                      </div>
                      <div className="mt-auto flex justify-center gap-4">
                        <div className="h-8 w-24 rounded-lg bg-background/40 border border-border dark:border-white/10" />
                        <div className="h-8 w-24 rounded-lg bg-background/40 border border-border dark:border-white/10" />
                        <div className="h-8 w-24 rounded-lg bg-primary/40 border border-primary/40 shadow-inner" />
                        <div className="h-8 w-24 rounded-lg bg-background/40 border border-border dark:border-white/10" />
                        <div className="h-8 w-24 rounded-lg bg-background/40 border border-border dark:border-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 text-left space-y-6">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium border-primary/40 bg-primary/10 text-primary">
                Neden Crewset?
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Dağınıklığı çekirdeğe toplar, güvenli ve ölçülebilir büyümeye çevirir
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Bugün müşteri ilişkileri mesaj akışında ve klasörlerde dağınık. Ne konuşuldu, hangi sözleşme nerede, kimin onayı bekleniyor? Belirsizlik büyüdükçe yenilemeler kaçıyor, gelir riske giriyor.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Crewset tüm müşteri ve sözleşmeleri tek bir çekirdeğe bağlar. Görüşmeler kayıtta kalır; kim, ne zaman, neyi onayladı netleşir. Ekip için erişim ve yetki kontrolü yerleşik gelir. Böylece tekrar eden gelir korunur ve büyüme düzenli, öngörülebilir bir çizgiye oturur.
              </p>
              <p className="text-lg md:text-xl font-semibold">
                İşinizi takip edemediğiniz için kaybetmenizi engeller.
              </p>
            </div>
          </div>
        </section>
        <PortfolioSection />
        <HowItWorksSection />
        <Features />
        <MobileAppSection />
        {/* Pricing kaldırıldı; yerine Erken Erişim alanı eklendi */}
        <EarlyAccessSection />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
