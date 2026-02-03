'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const resolved = React.use(params)
  const token = resolved.token
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [details, setDetails] = useState<any>(null)
  const [signed, setSigned] = useState(false)
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/contracts/sign/${token}`)
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

  const handleSign = async () => {
    if (!consent) {
      alert('Onay kutusunu işaretleyin.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/contracts/sign/${token}`, {
        method: 'POST'
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'İmza başarısız')
      } else {
        setSigned(true)
      }
    } catch (e: any) {
      setError('Sunucu hatası')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="max-w-lg mx-auto mt-12">Yükleniyor...</div>
  }

  if (error) {
    return <div className="max-w-lg mx-auto mt-12 text-red-600">{error}</div>
  }

  const Hero = () => (
    <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary/15 to-muted rounded-l-2xl p-10">
      <div className="h-full flex flex-col justify-center">
        <div className="text-3xl font-bold mb-4">Güvenli Elektronik Onay</div>
        <div className="text-muted-foreground">
          IP ve tarayıcı bilgileriyle kayıt altına alınan tek kullanımlık onay süreci.
        </div>
      </div>
    </div>
  )

  if (signed) {
    return (
      <div className="max-w-4xl mx-auto mt-16 grid lg:grid-cols-2 bg-background border rounded-2xl overflow-hidden">
        <Hero />
        <div className="p-8 space-y-4">
          <h1 className="text-3xl font-semibold">Elektronik onay tamamlandı</h1>
          <p className="text-muted-foreground">Tek kullanımlık bağlantı kullanıldı. Kaydınız alındı.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-16 grid lg:grid-cols-2 bg-background border rounded-2xl overflow-hidden">
      <Hero />
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-semibold">Sözleşme Elektronik Onayı</h1>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Bu elektronik onay, 6102 sayılı Türk Borçlar Kanunu ve 6100 sayılı HMK kapsamında
            takdiri delil niteliği taşır; nitelikli elektronik imza değildir.
          </p>
          <p>
            Onay verdiğinizde, IP adresiniz ve tarayıcı bilgilerinizi içeren bir kayıt oluşturulur.
            Bu kayıt, sözleşmenin onaylandığını göstermek amacıyla saklanır.
          </p>
          <p>
            Bağlantı sahibince belirlenen süre içinde geçerlidir ve tek kullanımlıktır.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <div>İmzalayan: {details?.signer_name || '—'}</div>
          <div>E-posta: {details?.signer_email || '—'}</div>
          <div>Son geçerlilik: {new Date(details?.expires_at).toLocaleString()}</div>
        </div>
        {details?.contract_template && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Sözleşme Metni</div>
            <div className="border rounded-md p-4 max-h-64 overflow-auto whitespace-pre-wrap text-sm">
              {details.contract_template}
            </div>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          Yukarıdaki beyanı okudum ve sözleşmeyi elektronik olarak onaylıyorum.
        </label>
        <Button onClick={handleSign}>Onayla</Button>
      </div>
    </div>
  )
}
