import { Link } from '@/navigation'
import { Check, Star, TrendingUp, Zap, Shield, Users, BarChart3, Bell, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTranslations } from 'next-intl/server'

export async function Pricing() {
  const t = await getTranslations('Pricing')

  const plans = [
    {
      name: 'Free',
      slug: 'free',
      price: '₺0',
      originalPrice: '',
      description: 'Başlamak için mükemmel',
      features: [
        '3 müşteriye kadar',
        '5 sözleşmeye kadar', 
        'Temel hatırlatmalar',
        'Temel raporlar',
        'E-posta desteği'
      ],
      popular: false,
      cta: 'Ücretsiz Başla',
      href: '/register'
    },
    {
      name: 'Pro',
      slug: 'pro',
      price: '₺450',
      originalPrice: '₺700',
      description: 'Gelişen freelancerlar için',
      features: [
        'Sınırsız müşteri',
        'Sınırsız sözleşme',
        'Gelir riski paneli',
        'Yenileme olasılığı analizi',
        'Detaylı raporlar',
        'Gelişmiş hatırlatmalar',
        'Öncelikli destek',
        'API erişimi',
        'Veri ihracatı (Excel/PDF)'
      ],
      popular: true,
      cta: 'Pro\'ya Geç',
      href: '/register?plan=pro'
    },
    {
      name: 'Agency',
      slug: 'agency',
      price: '₺1.200',
      originalPrice: '',
      description: 'Küçük ekipler için',
      features: [
        '3 kullanıcıya kadar',
        'Tüm Pro özellikleri',
        'Takım yönetimi',
        'Gelişmiş güvenlik',
        'Özel entegrasyonlar',
        'Telefon desteği',
        'Özelleştirme seçenekleri'
      ],
      popular: false,
      cta: 'İletişime Geç',
      href: '/contact'
    }
  ]

  return (
    <section id="pricing" className="relative py-20 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-primary/5" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-primary/15 blur-[160px]" />
      <div className="absolute -bottom-40 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/15 blur-[160px]" />
      
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
            <TrendingUp className="w-3 h-3 mr-1" />
            Fiyatlar %35 İndirimli
          </Badge>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            İşinizi büyütmenin en akıllı yolu
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Planınızı seçin, dakikalar içinde başlayın. Kredi kartı gerekmez.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'border-primary shadow-2xl shadow-primary/20 scale-105' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0 shadow-lg">
                    <Star className="w-3 h-3 mr-1" />
                    En Popüler
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center space-y-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl md:text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/ay</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-muted-foreground">
                      <span className="line-through">{plan.originalPrice}</span>
                      <Badge variant="destructive" className="ml-2">
                        %35 İNDİRİM
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Link href={plan.href} className="w-full">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Tüm Özellikler</h3>
            <p className="text-muted-foreground">Planlara göre özellik karşılaştırması</p>
          </div>
          
          <div className="space-y-4">
            {[
              { icon: Users, title: 'Müşteri Yönetimi', description: 'Sınırsız müşteri ve iletişim takibi' },
              { icon: Calendar, title: 'Sözleşme Takibi', description: 'Otomatik yenileme hatırlatmaları' },
              { icon: BarChart3, title: 'Gelir Analizi', description: 'Risk altındaki geliri görün' },
              { icon: Bell, title: 'Akıllı Bildirimler', description: 'Zamanında e-posta uyarıları' },
              { icon: Shield, title: 'Güvenlik', description: 'SSL şifreleme ve veri koruma' },
              { icon: Zap, title: 'Performans', description: 'Hızlı yükleme ve yanıt süresi' }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">Free</Badge>
                    <Badge variant="default" className="text-xs">Pro</Badge>
                    <Badge variant="secondary" className="text-xs">Agency</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            30 gün para iade garantisi
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?plan=pro">
              <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                Hemen Başla - 30 Gün Ücretsiz
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Daha Fazla Bilgi
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Kredi kartı gerekmez • Hemen başla • İstediğin zaman iptal et
          </p>
        </div>
      </div>
    </section>
  )
}
