import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { createClient } from '@/lib/supabase/server'

export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userProp = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()
    
    userProp = {
      name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
      email: user.email,
      image: profile?.avatar_url || user.user_metadata?.avatar_url
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={userProp} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
