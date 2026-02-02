import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { Footer } from '@/components/landing/footer'
import { PortfolioSection } from '@/components/landing/portfolio-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { TrustSection } from '@/components/landing/trust-section'
import { MobileAppSection } from '@/components/landing/mobile-app-section'
import { createClient } from '@/lib/supabase/server'

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
        <TrustSection />
        <MobileAppSection />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
