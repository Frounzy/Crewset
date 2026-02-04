'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function FeedbackPage() {
  const params = useParams()
  const token = (params?.token as string) || ''
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<any>(null)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState<number>(5)
  const [hover, setHover] = useState<number | null>(null)
  const [comment, setComment] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) {
          setError('Geçersiz bağlantı')
          return
        }
        const res = await fetch(`/api/feedback/${token}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Bir hata oluştu')
        } else {
          setDetails(data)
        }
      } catch (e: any) {
        setError('Sunucu hatası')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const labels = useMemo(() => ({
    1: 'Berbat',
    2: 'Zayıf',
    3: 'Orta',
    4: 'İyi',
    5: 'Mükemmel',
  }), [])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/feedback/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gönderim başarısız')
      } else {
        setSubmitted(true)
      }
    } catch (e: any) {
      setError('Sunucu hatası')
    } finally {
      setLoading(false)
    }
  }

  const ExpiryBadge = () => (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs">
      Son geçerlilik: {new Date(details?.expires_at).toLocaleString()}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/10 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Yükleniyor...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-destructive/10 flex items-center justify-center px-4">
        <Card className="max-w-lg w-full bg-background/60 backdrop-blur-md border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Hata
            </CardTitle>
            <CardDescription>Bağlantı doğrulanamadı.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-emerald-500/10 flex items-center justify-center px-4">
        <Card className="max-w-lg w-full bg-background/60 backdrop-blur-md border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
              Teşekkürler!
            </CardTitle>
            <CardDescription>Geri bildiriminiz başarıyla alındı.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Puanınız: {rating} / 5 {labels[rating as 1|2|3|4|5]}
            </div>
          </CardContent>
          <CardFooter>
            <ExpiryBadge />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/10 flex items-center justify-center px-4">
      <Card className="w-full max-w-xl bg-background/60 backdrop-blur-md border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Müşteri Geri Bildirimi</CardTitle>
          <CardDescription>Deneyiminizi yıldızlarla değerlendirin ve yorum ekleyin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="text-sm font-medium">Puan</div>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1
                const active = (hover ?? rating) >= value
                return (
                  <button
                    key={value}
                    aria-label={`${value} yıldız`}
                    onMouseEnter={() => setHover(value)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setRating(value)}
                    className={`p-2 rounded-md transition-colors ${active ? 'text-yellow-400' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Star className={`h-7 w-7 ${active ? 'fill-yellow-400' : 'fill-transparent'}`} />
                  </button>
                )
              })}
            </div>
            <div className="text-xs text-muted-foreground">{labels[(hover ?? rating) as 1|2|3|4|5]}</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Yorum</div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Deneyiminizi kısaca anlatabilir misiniz?"
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <ExpiryBadge />
          <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gönder
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
