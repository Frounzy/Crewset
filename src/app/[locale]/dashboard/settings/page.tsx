import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Settings | Crewset',
  robots: { index: false, follow: false },
}
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { DeleteAccount } from './delete-account'

export default async function SettingsPage() {
  const t = await getTranslations('Settings')

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>
      <div className="grid gap-4">
        <Card>
            <CardHeader>
                <CardTitle>{t('appearance')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="font-medium">{t('theme')}</p>
                        <p className="text-sm text-muted-foreground">{t('light')} / {t('dark')} / {t('system')}</p>
                    </div>
                    <ModeToggle />
                </div>
            </CardContent>
        </Card>

        <Card className="border-destructive/50">
            <CardHeader>
                <CardTitle className="text-destructive">{t('dangerZone') || 'Danger Zone'}</CardTitle>
                <CardDescription>{t('dangerZoneDesc') || 'Irreversible actions for your account.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="font-medium">{t('deleteAccount') || 'Delete Account'}</p>
                        <p className="text-sm text-muted-foreground">{t('deleteAccountDesc') || 'Permanently delete your account and all of your content.'}</p>
                    </div>
                    <DeleteAccount />
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
