'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'

import { PLANS } from '@/config/subscriptions'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBillingInfo } from './actions'

interface BillingClientProps {
  subscription: any
  profile: any
}

export function BillingClient({ subscription, profile }: BillingClientProps) {
  const t = useTranslations('Billing')
  const tPricing = useTranslations('Pricing')
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const handledRef = useRef(false)

  const currentPlan = subscription?.plan || 'free'
  
  // Expiration logic (re-adding if it was missing or just ensuring variables exist)
  const isExpiringSoon = subscription?.status === 'active' && subscription?.current_period_end && 
      new Date(subscription.current_period_end).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
  const daysLeft = subscription?.current_period_end ? Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  async function onSaveBillingInfo(formData: FormData) {
      setIsSaving(true)
      const res = await updateBillingInfo(null, formData)
      setIsSaving(false)
      if (res?.error) {
          toast({ title: "Error", description: res.error, variant: 'destructive' })
      } else {
          toast({ title: "Success", description: res.success || "Billing info updated" })
      }
  }

  useEffect(() => {
    const success = searchParams.get('success')
    const sessionId = searchParams.get('session_id')
    if (success === 'true' && sessionId && !handledRef.current) {
      handledRef.current = true
      const tryVerify = async () => {
        let attempts = 0
        const maxAttempts = 10
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

        while (attempts < maxAttempts) {
          attempts++
          try {
            const res = await fetch(`/api/payment/verify?session_id=${encodeURIComponent(sessionId)}`)
            const data = await res.json()
            if (data?.success) {
              toast({
                title: t('successTitle'),
                description: t('successDescription'),
              })
              break
            }
          } catch (e) {
            // noop
          }
          await delay(1500)
        }
      }

      tryVerify().finally(() => {
        const url = new URL(window.location.href)
        url.searchParams.delete('success')
        url.searchParams.delete('session_id')
        router.replace(url.toString())
        router.refresh()
      })
    }

    if (searchParams.get('canceled')) {
      toast({
        title: t('canceledTitle'),
        description: t('canceledDescription'),
        variant: 'destructive',
      })
    }
  }, [searchParams, toast, router, t])

  const onManageSubscription = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/payment/portal', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.message) {
         toast({
            title: t('subscription'),
            description: data.message,
         })
      }
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorDescription'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onCheckout = async (priceId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorDescription'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h3 className="text-lg font-medium">{t('title')}</h3>
            <p className="text-sm text-muted-foreground">
            {t('description')}
            </p>
        </div>
        {currentPlan !== 'free' && (
            <Button onClick={onManageSubscription} disabled={isLoading} variant="outline">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('manageSubscription')}
            </Button>
        )}
      </div>
      {currentPlan === 'free' && (
        <div className="border-2 border-dashed rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="flex-1">
              <h4 className="text-lg font-semibold mb-1">Daha fazla kontrol için planını yükseltebilirsin</h4>
              <p className="text-sm text-muted-foreground">
                Pro plan ile sınırsız sözleşme, gelir risk panosu ve gelişmiş raporlara erişim sağlarsın.
              </p>
              <div className="text-xs text-muted-foreground mt-3">
                Kredi kartı bilgileri güvende · İstediğin zaman iptal edebilirsin
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <Button
                className="w-full"
                onClick={() => {
                  const pro = PLANS.find((p) => p.slug === 'pro')
                  if (pro?.priceId) onCheckout(pro.priceId)
                }}
                disabled={isLoading || !PLANS.find((p) => p.slug === 'pro')?.priceId}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pro Plana Yükselt
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={plan.slug === currentPlan ? 'border-primary' : ''}
          >
            <CardHeader>
              <CardTitle>{tPricing(`plans.${plan.slug}.name`)}</CardTitle>
              <CardDescription>{tPricing(`plans.${plan.slug}.description`)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {t('perMonth')}
                </span>
              </div>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    {tPricing(`plans.${plan.slug}.features.${index}`)}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
                {plan.slug === currentPlan ? (
                     isExpiringSoon ? (
                        <Button 
                            className="w-full" 
                            onClick={() => onCheckout(plan.priceId)}
                            disabled={isLoading || !plan.priceId}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('renew')} ({daysLeft} days left)
                        </Button>
                     ) : (
                        <Button className="w-full" variant="outline" disabled>
                            {t('currentPlan')}
                        </Button>
                     )
                ) : (
                    <Button 
                        className="w-full" 
                        disabled={plan.slug === 'free' || isLoading || !plan.priceId}
                        onClick={() => onCheckout(plan.priceId)}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {plan.slug === 'free' ? t('downgradeInPortal') : t('upgrade')}
                    </Button>
                )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>{t('billingInfoTitle') || 'Invoice Information'}</CardTitle>
                <CardDescription>{t('billingInfoDesc') || 'Enter your company details for invoices.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={onSaveBillingInfo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="billing_company_name">{t('companyName') || 'Company Name'}</Label>
                        <Input id="billing_company_name" name="billing_company_name" defaultValue={profile?.billing_company_name} placeholder="Acme Inc." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="billing_tax_id">{t('taxId') || 'Tax ID / TC Identity No'}</Label>
                        <Input id="billing_tax_id" name="billing_tax_id" defaultValue={profile?.billing_tax_id} placeholder="1234567890" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="billing_tax_office">{t('taxOffice') || 'Tax Office'}</Label>
                        <Input id="billing_tax_office" name="billing_tax_office" defaultValue={profile?.billing_tax_office} placeholder="Kadikoy VD" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="billing_address">{t('address') || 'Billing Address'}</Label>
                        <Input id="billing_address" name="billing_address" defaultValue={profile?.billing_address} placeholder="Full address..." />
                    </div>
                    <div className="md:col-span-2">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('saveBillingInfo') || 'Save Invoice Details'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
