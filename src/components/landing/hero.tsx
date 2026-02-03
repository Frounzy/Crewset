import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function Hero() {
  const t = await getTranslations('Hero')

  return (
    <section className="relative px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-b from-primary/10 via-background to-background"></div>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 -z-10 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute -bottom-40 right-1/3 -z-10 h-[420px] w-[420px] rounded-full bg-purple-500/20 blur-[140px]" />
      <div className="max-w-7xl mx-auto text-center space-y-8 pt-24 pb-40 md:pt-36 md:pb-56">
        <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <ShieldCheck className="w-4 h-4 mr-2" />
            {t('badge')}
        </div>
        <h1 
            className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
            dangerouslySetInnerHTML={{ __html: t.raw('title') }}
        />
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('description')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
            <Button size="lg" className="h-12 px-8 text-lg shadow-lg shadow-primary/20">
                {t('startForFree')}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            </Link>
            <Link href="#features">
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-primary/20">
                {t('learnMore')}
            </Button>
            </Link>
        </div>

        <div className="mt-16 relative mx-auto w-full max-w-6xl">
            <div className="rounded-2xl border bg-background/60 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/30 p-3 ring-1 ring-inset ring-primary/20">
                <div className="rounded-xl border bg-background shadow-sm overflow-hidden aspect-[16/9] flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted/30 via-background to-muted/20">
                     <div className="w-full h-full grid grid-cols-4 grid-rows-6 gap-4 p-8">
                        <div className="row-span-6 col-span-1 bg-muted/40 rounded-lg hidden md:block"></div>
                        <div className="col-span-4 md:col-span-3 h-12 bg-muted/40 rounded-lg flex items-center px-4 gap-2">
                             <div className="w-4 h-4 rounded-full bg-muted/60"></div>
                             <div className="w-32 h-4 rounded bg-muted/60"></div>
                        </div>
                        <div className="col-span-2 md:col-span-1 h-24 bg-primary/15 border border-primary/30 rounded-lg"></div>
                        <div className="col-span-2 md:col-span-1 h-24 bg-muted/40 rounded-lg"></div>
                        <div className="col-span-2 md:col-span-1 h-24 bg-muted/40 rounded-lg"></div>
                        <div className="col-span-4 md:col-span-3 row-span-4 bg-muted/40 rounded-lg flex items-end justify-around p-4 pb-0 gap-2">
                            <div className="w-full h-[40%] bg-muted/60 rounded-t"></div>
                            <div className="w-full h-[70%] bg-muted/60 rounded-t"></div>
                            <div className="w-full h-[50%] bg-primary/30 rounded-t"></div>
                            <div className="w-full h-[80%] bg-muted/60 rounded-t"></div>
                            <div className="w-full h-[60%] bg-muted/60 rounded-t"></div>
                        </div>
                     </div>
                </div>
            </div>
            <div className="absolute -top-16 -left-16 -z-10 h-[320px] w-[320px] rounded-full bg-primary/25 blur-[120px]" />
            <div className="absolute -bottom-16 -right-16 -z-10 h-[320px] w-[320px] rounded-full bg-blue-500/25 blur-[120px]" />
        </div>
      </div>
    </section>
  )
}
