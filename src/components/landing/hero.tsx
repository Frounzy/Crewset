import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function Hero() {
  const t = await getTranslations('Hero')

  return (
    <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {t('badge')}
        </div>
        <h1 
            className="text-4xl md:text-6xl font-bold tracking-tight"
            dangerouslySetInnerHTML={{ __html: t.raw('title') }}
        />
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
            <Button size="lg" className="h-12 px-8 text-lg">
                {t('startForFree')}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            </Link>
            <Link href="#features">
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                {t('learnMore')}
            </Button>
            </Link>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-16 relative mx-auto w-full max-w-5xl lg:max-w-6xl">
            <div className="rounded-xl border bg-background/50 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/20 p-2 ring-1 ring-inset ring-border/50 lg:rounded-2xl lg:p-4">
                <div className="rounded-md border bg-background shadow-sm overflow-hidden aspect-[16/9] flex items-center justify-center text-muted-foreground bg-muted/20">
                     {/* Abstract Dashboard UI */}
                     <div className="w-full h-full grid grid-cols-4 grid-rows-6 gap-4 p-8">
                        {/* Sidebar */}
                        <div className="row-span-6 col-span-1 bg-muted/40 rounded-lg hidden md:block"></div>
                        {/* Header */}
                        <div className="col-span-4 md:col-span-3 h-12 bg-muted/40 rounded-lg flex items-center px-4 gap-2">
                             <div className="w-4 h-4 rounded-full bg-muted/60"></div>
                             <div className="w-32 h-4 rounded bg-muted/60"></div>
                        </div>
                        {/* Cards */}
                        <div className="col-span-2 md:col-span-1 h-24 bg-primary/10 border border-primary/20 rounded-lg"></div>
                        <div className="col-span-2 md:col-span-1 h-24 bg-muted/40 rounded-lg"></div>
                        <div className="col-span-2 md:col-span-1 h-24 bg-muted/40 rounded-lg"></div>
                        {/* Chart */}
                        <div className="col-span-4 md:col-span-3 row-span-4 bg-muted/40 rounded-lg flex items-end justify-around p-4 pb-0 gap-2">
                            <div className="w-full h-[40%] bg-muted/60 rounded-t"></div>
                            <div className="w-full h-[70%] bg-muted/60 rounded-t"></div>
                            <div className="w-full h-[50%] bg-primary/20 rounded-t"></div>
                            <div className="w-full h-[80%] bg-muted/60 rounded-t"></div>
                            <div className="w-full h-[60%] bg-muted/60 rounded-t"></div>
                        </div>
                     </div>
                </div>
            </div>
            <div className="absolute -top-12 -left-12 -z-10 h-[300px] w-[300px] rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute -bottom-12 -right-12 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/20 blur-[100px]" />
        </div>
      </div>
    </section>
  )
}
