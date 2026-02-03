'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createSignLinkAction } from './actions'

interface Props {
  contractId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignLinkDialog({ contractId, open, onOpenChange }: Props) {
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createSignLinkAction(contractId, signerName || undefined, signerEmail || undefined)
      if ((res as any)?.url) {
        setResultUrl((res as any).url)
      } else {
        alert((res as any)?.error || 'Hata')
      }
    })
  }

  const handleCopy = async () => {
    if (resultUrl) {
      await navigator.clipboard.writeText(resultUrl)
      alert('Link kopyalandı')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>İmza Linki Oluştur</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">İmzalayan Ad Soyad (opsiyonel)</label>
            <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="Ad Soyad" />
          </div>
          <div className="space-y-2">
            <label className="text-sm">İmzalayan E-posta (opsiyonel)</label>
            <Input type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} placeholder="email@domain.com" />
          </div>
          {resultUrl && (
            <div className="space-y-2">
              <label className="text-sm">Oluşturulan Link</label>
              <div className="flex items-center gap-2">
                <Input readOnly value={resultUrl} />
                <Button variant="secondary" onClick={handleCopy}>Kopyala</Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={isPending}>Oluştur</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
