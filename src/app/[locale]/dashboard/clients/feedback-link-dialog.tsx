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
import { createFeedbackLinkAction } from './actions'
import { useTranslations } from 'next-intl'
import { toast } from '@/hooks/use-toast'

interface Props {
  clientId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackLinkDialog({ clientId, open, onOpenChange }: Props) {
  const t = useTranslations('Clients')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createFeedbackLinkAction(clientId)
      if ((res as any)?.url) {
        setResultUrl((res as any).url)
      } else {
        alert((res as any)?.error || 'Hata')
      }
    })
  }

  const handleCopy = () => {
    if (resultUrl) {
      try {
        navigator.clipboard.writeText(resultUrl)
        toast({ title: 'Link kopyalandı', description: 'Panoya kopyalandı' })
      } catch (err) {
        try {
          const input = document.createElement('input')
          input.value = resultUrl
          document.body.appendChild(input)
          input.select()
          document.execCommand('copy')
          document.body.removeChild(input)
          toast({ title: 'Link kopyalandı', description: 'Panoya kopyalandı (fallback)' })
        } catch {
          toast({ title: 'Kopyalama başarısız', description: 'Lütfen manuel kopyalayın', variant: 'destructive' as any })
        }
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback Linki</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t('feedbackLinkDescription')}
          </p>
        </DialogHeader>
        {!resultUrl ? (
          <div className="space-y-4">
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? 'Oluşturuluyor...' : 'Linki Oluştur'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input value={resultUrl} readOnly />
            <DialogFooter>
              <Button 
                variant="secondary" 
                onClick={() => resultUrl && window.open(resultUrl, '_blank')}
              >
                Aç
              </Button>
              <Button onClick={handleCopy}>Kopyala</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
