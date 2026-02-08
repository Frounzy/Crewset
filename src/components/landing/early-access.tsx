"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Rocket, ShieldCheck, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

export function EarlyAccessSection() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      company: String(formData.get('company') || '').trim(),
      purpose: String(formData.get('purpose') || '').trim(),
    }
    if (!payload.name || !payload.email) {
      toast({ title: 'Eksik bilgi', description: 'Ad Soyad ve E-posta zorunludur', variant: 'destructive' as any })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data?.success) {
        toast({
          title: 'Başvuru alındı',
          description: 'Başvurunuz alınmıştır. İncelendikten sonra sizinle iletişime geçilecektir.',
        })
        form.reset()
        setOpen(false)
      } else {
        toast({
          title: 'Gönderim başarısız',
          description: data?.error || 'Lütfen daha sonra tekrar deneyin',
          variant: 'destructive' as any,
        })
      }
    } catch {
      toast({
        title: 'Sunucu hatası',
        description: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin',
        variant: 'destructive' as any,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative px-4 py-20 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/15 via-background to-background" />
      <div className="absolute -top-48 left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-primary/25 blur-[160px]" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium border-primary/40 bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
            Erken Erişim
          </div>
          <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Crewset’i herkesten önce deneyin
          </h3>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Sınırlı sayıda kullanıcıyla ürünün geleceğini birlikte şekillendiriyoruz.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" onClick={() => setOpen(true)} className="shadow-lg hover:shadow-xl">
              <Rocket className="h-4 w-4 mr-2" />
              Başvuru Yap
            </Button>
            <Button size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
              Daha Fazla Bilgi
            </Button>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/20 to-primary/0">
            <div className="rounded-2xl bg-background/80 backdrop-blur border border-border p-6 transition-colors group-hover:border-primary/40">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl border border-border bg-primary/10 flex items-center justify-center shadow-inner transition group-hover:ring-2 group-hover:ring-primary/30">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="font-semibold">Topluluk ile geliştirme</div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Geri bildirimleriniz ürünün yönünü doğrudan etkiler.
              </p>
            </div>
          </div>

          <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/20 to-primary/0">
            <div className="rounded-2xl bg-background/80 backdrop-blur border border-border p-6 transition-colors group-hover:border-primary/40">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl border border-border bg-primary/10 flex items-center justify-center shadow-inner transition group-hover:ring-2 group-hover:ring-primary/30">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="font-semibold">Öncelikli avantajlar</div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Erken erişim süresince özel ayrıcalıklardan yararlanırsınız.
              </p>
            </div>
          </div>

          <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/20 to-primary/0">
            <div className="rounded-2xl bg-background/80 backdrop-blur border border-border p-6 transition-colors group-hover:border-primary/40">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl border border-border bg-primary/10 flex items-center justify-center shadow-inner transition group-hover:ring-2 group-hover:ring-primary/30">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="font-semibold">Yeni özelliklere erişim</div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Özellikleri herkesten önce deneyimleyin ve yön verin.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-xs md:text-sm text-muted-foreground">
          Başvurular manuel olarak incelenir. Her başvuru kabul edilmeyebilir.
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erken Erişim Başvuru Formu</DialogTitle>
            <DialogDescription>
              Crewset erken erişim süreci sınırlıdır. Başvurunuzu iletin, size en kısa sürede dönüş yapalım.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Ad Soyad</div>
                <Input name="name" placeholder="Adınız Soyadınız" required />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">E-posta</div>
                <Input type="email" name="email" placeholder="you@example.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Firma / Proje Adı</div>
              <Input name="company" placeholder="Opsiyonel" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Crewset’i ne için kullanmayı planlıyorsunuz?</div>
              <Textarea name="purpose" placeholder="Kısaca anlatın (opsiyonel)" className="min-h-[120px]" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
