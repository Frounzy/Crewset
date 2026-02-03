import { Smartphone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function MobileAppSection() {
  const t = await getTranslations('MobileApp')

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-transparent to-primary/5 border-y border-border/50 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24">
          <div className="flex-1 space-y-6 text-center md:text-left z-10">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors border-primary/40 bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                <rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect>
                <path d="M11 18h2"></path>
              </svg>
              {t('badge')}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              {t('title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
               <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border/50 text-foreground/80 shadow-sm hover:border-primary/50 transition-colors cursor-not-allowed opacity-70 group">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 group-hover:text-primary transition-colors"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.96-.93.66 0 2.44.1 3.59 1.74-3.29 1.97-2.73 5.92.59 7.31-.67 1.83-1.6 3.63-3.22 4.11zm-2.7-16.1c1.24-1.5 2.16-3.05 1.91-4.18-1.55.08-3.41 1.07-4.26 2.09-.76.92-1.44 2.45-1.13 3.86 1.66.13 3.23-1.07 3.48-1.77z"/></svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Coming soon to</div>
                    <div className="text-lg font-bold leading-none">App Store</div>
                  </div>
               </div>
               <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border/50 text-foreground/80 shadow-sm hover:border-primary/50 transition-colors cursor-not-allowed opacity-70 group">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 group-hover:text-primary transition-colors"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm11.666 11.667l3.664 3.664-9.332 5.332 5.668-9zm4.248-4.248l-3.08 3.08 3.08 3.08c.78-.78.78-2.048 0-2.828l-3.08-3.08 3.08-3.08zM5.275 1.47l9.332 5.332-3.664 3.664-5.668-8.996z"/></svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Coming soon to</div>
                    <div className="text-lg font-bold leading-none">Google Play</div>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="flex-1 relative w-full flex justify-center md:justify-end">
             <div className="relative border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-zinc-950 flex flex-col">
                    <div className="h-40 bg-gradient-to-br from-primary to-violet-600 p-6 pt-12 text-primary-foreground relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#ffffff33_0,transparent_40%),radial-gradient(circle_at_70%_0%,#00000022_0,transparent_50%)]"></div>
                        <div className="absolute top-4 left-4 rounded-full px-3 py-1 bg-white/20 backdrop-blur text-sm font-semibold">C</div>
                        <div className="text-2xl font-bold tracking-tight">{t('phone.greeting')}</div>
                        <div className="text-sm/relaxed opacity-90">{t('phone.contractsApproaching')}</div>
                    </div>
                    
                    <div className="p-4 space-y-3 flex-1 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('phone.upcoming')}</div>
                        
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/70 border border-border shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-100 text-orange-700 font-bold text-xs">2G</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{t('phone.contract1')}</div>
                                <div className="text-xs text-muted-foreground truncate">{t('phone.contract1Date')}</div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/70 border border-border shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 text-amber-700 font-bold text-xs">4G</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{t('phone.contract2')}</div>
                                <div className="text-xs text-muted-foreground truncate">{t('phone.contract2Date')}</div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/70 border border-border shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-100 text-rose-700 font-bold text-xs">6G</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{t('phone.contract3')}</div>
                                <div className="text-xs text-muted-foreground truncate">{t('phone.contract3Date')}</div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-100 dark:border-indigo-900/40">
                            <div className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-1">{t('phone.revenueAnalytics')}</div>
                            <div className="flex items-end gap-2 h-16 justify-between px-2">
                                <div className="w-4 h-[40%] rounded-t bg-gradient-to-t from-indigo-200 to-indigo-400 dark:from-indigo-800 dark:to-indigo-600"></div>
                                <div className="w-4 h-[60%] rounded-t bg-gradient-to-t from-indigo-200 to-indigo-400 dark:from-indigo-800 dark:to-indigo-600"></div>
                                <div className="w-4 h-[80%] rounded-t bg-gradient-to-t from-violet-300 to-violet-500 dark:from-violet-700 dark:to-violet-500"></div>
                                <div className="w-4 h-[50%] rounded-t bg-gradient-to-t from-indigo-200 to-indigo-400 dark:from-indigo-800 dark:to-indigo-600"></div>
                                <div className="w-4 h-[70%] rounded-t bg-gradient-to-t from-indigo-200 to-indigo-400 dark:from-indigo-800 dark:to-indigo-600"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tab Bar */}
                    <div className="h-16 border-t bg-white dark:bg-zinc-950 flex items-center justify-around px-2">
                         <div className="p-2 text-primary">
                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                             <rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect>
                             <path d="M11 18h2"></path>
                           </svg>
                         </div>
                         <div className="p-2 text-muted-foreground/50"><div className="w-6 h-6 rounded-full border-2 border-current"></div></div>
                         <div className="p-2 text-muted-foreground/50"><div className="w-6 h-6 rounded border-2 border-current"></div></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
