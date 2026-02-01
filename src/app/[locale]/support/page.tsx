import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { ContactForm } from './contact-form';
import { createClient } from '@/lib/supabase/server';

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Support');

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
      <main className="flex-1 container mx-auto py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-xl text-muted-foreground">
                    {t('description')}
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-8">
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-xl">{t('email.title')}</h3>
                                <p className="text-sm text-muted-foreground">{t('email.description')}</p>
                            </div>
                        </div>
                        <p className="text-sm">support@crewset.com</p>
                    </div>

                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-xl">{t('faq.title')}</h3>
                                <p className="text-sm text-muted-foreground">{t('faq.description')}</p>
                            </div>
                        </div>
                        <Button asChild variant="outline" className="w-full">
                            <a href="/#faq">{t('faq.button')}</a>
                        </Button>
                    </div>
                </div>

                <ContactForm />
            </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
