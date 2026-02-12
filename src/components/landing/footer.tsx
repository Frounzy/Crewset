import { Link } from '@/navigation'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('Footer')

  return (
    <footer className="border-t py-12 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Crewset</h3>
          <p className="text-sm text-muted-foreground">
            {t('tagline')}
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">{t('product')}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#features" className="hover:text-foreground">{t('links.features')}</Link></li>
            <li><Link href="#pricing" className="hover:text-foreground">{t('links.pricing')}</Link></li>
            <li><Link href="#" className="hover:text-foreground">{t('links.roadmap')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">{t('legal')}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/privacy" className="hover:text-foreground">{t('links.privacy')}</Link></li>
            <li><Link href="/terms" className="hover:text-foreground">{t('links.terms')}</Link></li>
            <li><Link href="/refund" className="hover:text-foreground">{t('links.refund')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">{t('connect')}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#" className="hover:text-foreground">{t('links.twitter')}</Link></li>
            <li><Link href="#" className="hover:text-foreground">{t('links.linkedin')}</Link></li>
            <li><Link href="/support" className="hover:text-foreground">{t('links.contact')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Crewset. {t('rights')}
      </div>
    </footer>
  )
}
