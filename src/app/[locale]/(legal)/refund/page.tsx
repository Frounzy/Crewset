import { getTranslations } from 'next-intl/server';
import { RefundTR, RefundEN } from '@/components/legal/legal-contents';
import { Card, CardContent } from '@/components/ui/card'

export default async function RefundPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Legal.Refund');
  
  return (
     <section className="relative py-20 bg-gradient-to-b from-primary/10 via-background to-background">
       <div className="absolute -top-24 -left-24 h-[360px] w-[360px] rounded-full bg-primary/15 blur-[120px]" />
       <div className="absolute -bottom-24 -right-24 h-[360px] w-[360px] rounded-full bg-purple-500/15 blur-[120px]" />
       <div className="max-w-4xl mx-auto px-4 space-y-8">
         <div className="text-center space-y-3">
           <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
           <p className="text-muted-foreground">İptal ve iade şartları net ve anlaşılır.</p>
         </div>
         <Card>
           <CardContent className="p-8">
             <div className="prose dark:prose-invert max-w-none">
               {locale === 'tr' ? <RefundTR /> : <RefundEN />}
             </div>
           </CardContent>
         </Card>
       </div>
     </section>
  )
}
